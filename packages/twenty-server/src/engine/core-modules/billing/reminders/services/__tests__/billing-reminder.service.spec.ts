import { addDays } from 'date-fns';
import {
  BillingSubscriptionRenewingEmail,
  BillingTrialConvertingEmail,
  BillingTrialEndingEmail,
} from 'twenty-emails';

import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import {
  BILLING_RENEWAL_REMINDER_SENT_KEY,
  BILLING_TRIAL_REMINDER_SENT_KEY,
} from 'src/engine/core-modules/billing/reminders/constants/billing-reminder-sent-keys.constant';
import { BillingReminderService } from 'src/engine/core-modules/billing/reminders/services/billing-reminder.service';

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<html></html>'),
}));
jest.mock('twenty-emails', () => ({
  BillingTrialEndingEmail: jest.fn(),
  BillingTrialConvertingEmail: jest.fn(),
  BillingSubscriptionRenewingEmail: jest.fn(),
}));

const CONFIG: Record<string, unknown> = {
  IS_BILLING_ENABLED: true,
  BILLING_TRIAL_WITHOUT_CREDIT_CARD_REMINDER_DAYS_BEFORE: 1,
  BILLING_TRIAL_WITH_CREDIT_CARD_REMINDER_DAYS_BEFORE: 7,
  BILLING_SUBSCRIPTION_RENEWAL_REMINDER_DAYS_BEFORE: 7,
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: 30,
  BILLING_FREE_TRIAL_WITHOUT_CREDIT_CARD_DURATION_IN_DAYS: 7,
  WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION: 14,
  EMAIL_FROM_NAME: 'Twenty',
  EMAIL_FROM_ADDRESS: 'noreply@twenty.com',
};

const buildService = ({
  trialingSubscriptions = [],
  renewingSubscriptions = [],
  alreadySentBoundary,
}: {
  // oxlint-disable-next-line typescript/no-explicit-any
  trialingSubscriptions?: any[];
  // oxlint-disable-next-line typescript/no-explicit-any
  renewingSubscriptions?: any[];
  alreadySentBoundary?: string;
}) => {
  const emailSend = jest.fn().mockResolvedValue(undefined);
  const userVarsSet = jest.fn().mockResolvedValue(undefined);

  const billingSubscriptionRepository = {
    find: jest
      .fn()
      .mockImplementation(({ where }) =>
        where.status === SubscriptionStatus.Trialing
          ? trialingSubscriptions
          : renewingSubscriptions,
      ),
  };
  const workspaceRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 'workspace-1', displayName: 'Acme Inc.' }),
  };
  const userService = {
    loadWorkspaceMembers: jest.fn().mockResolvedValue([
      {
        name: { firstName: 'John', lastName: 'Doe' },
        locale: 'en',
        userEmail: 'john@acme.com',
      },
    ]),
  };
  const userVarsService = {
    get: jest.fn().mockResolvedValue(alreadySentBoundary),
    set: userVarsSet,
  };
  const emailService = { send: emailSend };
  const i18nService = { getI18nInstance: () => ({ _: () => 'subject' }) };
  const twentyConfigService = { get: (key: string) => CONFIG[key] };
  const workspaceDomainsService = {
    buildWorkspaceURL: jest.fn(
      () => new URL('https://acme.twenty.com/settings/billing'),
    ),
  };

  const service = new BillingReminderService(
    // oxlint-disable-next-line typescript/no-explicit-any
    twentyConfigService as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    billingSubscriptionRepository as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    workspaceRepository as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    userService as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    userVarsService as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    emailService as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    i18nService as any,
    // oxlint-disable-next-line typescript/no-explicit-any
    workspaceDomainsService as any,
  );

  return { service, emailSend, userVarsSet };
};

describe('BillingReminderService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends the add-a-card email the day before a no-credit-card trial ends', async () => {
    const trialEnd = addDays(new Date(), 1);
    const { service, emailSend } = buildService({
      trialingSubscriptions: [
        {
          workspaceId: 'workspace-1',
          status: SubscriptionStatus.Trialing,
          interval: SubscriptionInterval.Month,
          trialStart: addDays(new Date(), -6),
          trialEnd,
          billingCustomer: { hasPaymentMethod: false },
        },
      ],
    });

    await service.processReminders();

    expect(BillingTrialEndingEmail).toHaveBeenCalledTimes(1);
    expect(BillingTrialEndingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        trialEndsAt: trialEnd,
        dataRetentionDays: 14,
        link: 'https://acme.twenty.com/settings/billing',
      }),
    );
    expect(BillingTrialConvertingEmail).not.toHaveBeenCalled();
    expect(emailSend).toHaveBeenCalledTimes(1);
  });

  it('sends the upcoming-charge email 7 days before a credit-card trial converts', async () => {
    const trialEnd = addDays(new Date(), 7);
    const { service, userVarsSet } = buildService({
      trialingSubscriptions: [
        {
          workspaceId: 'workspace-1',
          status: SubscriptionStatus.Trialing,
          interval: SubscriptionInterval.Month,
          trialStart: addDays(new Date(), -23),
          trialEnd,
          billingCustomer: { hasPaymentMethod: true },
        },
      ],
    });

    await service.processReminders();

    expect(BillingTrialConvertingEmail).toHaveBeenCalledWith(
      expect.objectContaining({ trialEndsAt: trialEnd, interval: 'month' }),
    );
    expect(BillingTrialEndingEmail).not.toHaveBeenCalled();
    expect(userVarsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        key: BILLING_TRIAL_REMINDER_SENT_KEY,
        value: trialEnd.toISOString(),
      }),
    );
  });

  it('classifies a card-on-file trial as converting even when hasPaymentMethod and trialStart are not yet synced', async () => {
    const trialEnd = addDays(new Date(), 5);
    const { service } = buildService({
      trialingSubscriptions: [
        {
          workspaceId: 'workspace-1',
          status: SubscriptionStatus.Trialing,
          interval: SubscriptionInterval.Month,
          trialStart: null,
          trialEnd,
          createdAt: addDays(new Date(), -25),
          billingCustomer: { hasPaymentMethod: null },
        },
      ],
    });

    await service.processReminders();

    expect(BillingTrialConvertingEmail).toHaveBeenCalled();
    expect(BillingTrialEndingEmail).not.toHaveBeenCalled();
  });

  it('does not send twice for the same boundary (idempotent)', async () => {
    const trialEnd = addDays(new Date(), 7);
    const { service, emailSend, userVarsSet } = buildService({
      trialingSubscriptions: [
        {
          workspaceId: 'workspace-1',
          status: SubscriptionStatus.Trialing,
          interval: SubscriptionInterval.Month,
          trialStart: addDays(new Date(), -23),
          trialEnd,
          billingCustomer: { hasPaymentMethod: true },
        },
      ],
      alreadySentBoundary: trialEnd.toISOString(),
    });

    await service.processReminders();

    expect(BillingTrialConvertingEmail).not.toHaveBeenCalled();
    expect(emailSend).not.toHaveBeenCalled();
    expect(userVarsSet).not.toHaveBeenCalled();
  });

  it('sends a renewal reminder 7 days before a yearly subscription renews', async () => {
    const renewsAt = addDays(new Date(), 7);
    const { service, userVarsSet } = buildService({
      renewingSubscriptions: [
        {
          workspaceId: 'workspace-1',
          status: SubscriptionStatus.Active,
          interval: SubscriptionInterval.Year,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: renewsAt,
        },
      ],
    });

    await service.processReminders();

    expect(BillingSubscriptionRenewingEmail).toHaveBeenCalledWith(
      expect.objectContaining({ renewsAt }),
    );
    expect(userVarsSet).toHaveBeenCalledWith(
      expect.objectContaining({
        key: BILLING_RENEWAL_REMINDER_SENT_KEY,
        value: renewsAt.toISOString(),
      }),
    );
  });

  it('does nothing when billing is disabled', async () => {
    const { service, emailSend } = buildService({
      trialingSubscriptions: [
        {
          workspaceId: 'workspace-1',
          status: SubscriptionStatus.Trialing,
          interval: SubscriptionInterval.Month,
          trialStart: addDays(new Date(), -6),
          trialEnd: addDays(new Date(), 1),
          billingCustomer: { hasPaymentMethod: false },
        },
      ],
    });
    CONFIG.IS_BILLING_ENABLED = false;

    await service.processReminders();

    expect(emailSend).not.toHaveBeenCalled();
    CONFIG.IS_BILLING_ENABLED = true;
  });
});
