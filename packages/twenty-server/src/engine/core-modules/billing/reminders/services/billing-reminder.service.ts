/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { addDays, differenceInCalendarDays } from 'date-fns';
import {
  BillingSubscriptionRenewingEmail,
  BillingTrialConvertingEmail,
  BillingTrialEndingEmail,
} from 'twenty-emails';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Between, Repository } from 'typeorm';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionInterval } from 'src/engine/core-modules/billing/enums/billing-subscription-interval.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import {
  BILLING_REMINDER_SETTINGS_URL,
  BILLING_RENEWAL_REMINDER_SENT_KEY,
  BILLING_TRIAL_REMINDER_SENT_KEY,
} from 'src/engine/core-modules/billing/reminders/constants/billing-reminder-sent-keys.constant';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// Reminders the cron can send. A given trial gets exactly one of "ending" / "converting".
type BillingReminderEmail =
  | { type: 'trial-ending'; trialEndsAt: Date }
  | { type: 'trial-converting'; trialEndsAt: Date; interval: 'month' | 'year' }
  | { type: 'subscription-renewing'; renewsAt: Date };

@Injectable()
export class BillingReminderService {
  private readonly logger = new Logger(BillingReminderService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    // Billing reminders run as a cross-workspace cron, so no workspaceId is in scope.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly userService: UserService,
    private readonly userVarsService: UserVarsService,
    private readonly emailService: EmailService,
    private readonly i18nService: I18nService,
  ) {}

  async processReminders(): Promise<void> {
    // Hard safety guard: these emails reach real customers, so they are OFF by
    // default and only ever sent when an operator explicitly opts in. This check
    // runs on every invocation (not just at cron registration) so the emails can
    // never be sent inadvertently, whatever triggers this job.
    if (
      !this.twentyConfigService.get('IS_BILLING_ENABLED') ||
      !this.twentyConfigService.get('BILLING_REMINDER_EMAILS_ENABLED')
    ) {
      this.logger.log(
        'Billing reminder emails are disabled (BILLING_REMINDER_EMAILS_ENABLED is false); skipping.',
      );

      return;
    }

    const now = new Date();

    await this.processTrialReminders(now);
    await this.processRenewalReminders(now);
  }

  private async processTrialReminders(now: Date): Promise<void> {
    const withoutCardDaysBefore = this.twentyConfigService.get(
      'BILLING_TRIAL_WITHOUT_CREDIT_CARD_REMINDER_DAYS_BEFORE',
    );
    const withCardDaysBefore = this.twentyConfigService.get(
      'BILLING_TRIAL_WITH_CREDIT_CARD_REMINDER_DAYS_BEFORE',
    );
    const windowEnd = addDays(
      now,
      Math.max(withoutCardDaysBefore, withCardDaysBefore) + 1,
    );

    const trialingSubscriptions = await this.billingSubscriptionRepository.find(
      {
        where: {
          status: SubscriptionStatus.Trialing,
          trialEnd: Between(now, windowEnd),
        },
        relations: ['billingCustomer'],
      },
    );

    for (const subscription of trialingSubscriptions) {
      const trialEnd = subscription.trialEnd;

      if (!isDefined(trialEnd)) {
        continue;
      }

      const daysUntilTrialEnd = differenceInCalendarDays(trialEnd, now);

      if (daysUntilTrialEnd < 0) {
        continue;
      }

      const isWithCardTrial = this.isWithCreditCardTrial(subscription);

      let reminder: BillingReminderEmail | undefined;

      if (isWithCardTrial && daysUntilTrialEnd <= withCardDaysBefore) {
        reminder = {
          type: 'trial-converting',
          trialEndsAt: trialEnd,
          interval:
            subscription.interval === SubscriptionInterval.Year
              ? 'year'
              : 'month',
        };
      } else if (
        !isWithCardTrial &&
        daysUntilTrialEnd <= withoutCardDaysBefore
      ) {
        reminder = { type: 'trial-ending', trialEndsAt: trialEnd };
      }

      if (!isDefined(reminder)) {
        continue;
      }

      await this.sendReminderIfNotAlreadySent({
        workspaceId: subscription.workspaceId,
        sentKey: BILLING_TRIAL_REMINDER_SENT_KEY,
        boundary: trialEnd,
        reminder,
      });
    }
  }

  private async processRenewalReminders(now: Date): Promise<void> {
    const renewalDaysBefore = this.twentyConfigService.get(
      'BILLING_SUBSCRIPTION_RENEWAL_REMINDER_DAYS_BEFORE',
    );
    const windowEnd = addDays(now, renewalDaysBefore + 1);

    // Only yearly subscriptions get a renewal reminder; monthly ones would be noise.
    const renewingSubscriptions = await this.billingSubscriptionRepository.find(
      {
        where: {
          status: SubscriptionStatus.Active,
          interval: SubscriptionInterval.Year,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: Between(now, windowEnd),
        },
      },
    );

    for (const subscription of renewingSubscriptions) {
      const renewsAt = subscription.currentPeriodEnd;

      const daysUntilRenewal = differenceInCalendarDays(renewsAt, now);

      if (daysUntilRenewal < 0 || daysUntilRenewal > renewalDaysBefore) {
        continue;
      }

      await this.sendReminderIfNotAlreadySent({
        workspaceId: subscription.workspaceId,
        sentKey: BILLING_RENEWAL_REMINDER_SENT_KEY,
        boundary: renewsAt,
        reminder: { type: 'subscription-renewing', renewsAt },
      });
    }
  }

  private isWithCreditCardTrial(
    subscription: BillingSubscriptionEntity,
  ): boolean {
    if (subscription.billingCustomer?.hasPaymentMethod === true) {
      return true;
    }

    // Fallback for customers whose payment-method flag is not synced yet: a 30-day
    // (with-credit-card) trial is distinguishable from a 7-day one by its duration.
    const withCardTrialDurationDays = this.twentyConfigService.get(
      'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
    );

    if (
      isDefined(subscription.trialStart) &&
      isDefined(subscription.trialEnd)
    ) {
      return (
        differenceInCalendarDays(
          subscription.trialEnd,
          subscription.trialStart,
        ) === withCardTrialDurationDays
      );
    }

    return false;
  }

  private async sendReminderIfNotAlreadySent({
    workspaceId,
    sentKey,
    boundary,
    reminder,
  }: {
    workspaceId: string;
    sentKey:
      | typeof BILLING_TRIAL_REMINDER_SENT_KEY
      | typeof BILLING_RENEWAL_REMINDER_SENT_KEY;
    boundary: Date;
    reminder: BillingReminderEmail;
  }): Promise<void> {
    try {
      const boundaryValue = boundary.toISOString();

      const alreadySentBoundary = await this.userVarsService.get({
        workspaceId,
        key: sentKey,
      });

      if (alreadySentBoundary === boundaryValue) {
        return;
      }

      const workspace = await this.workspaceRepository.findOne({
        where: {
          id: workspaceId,
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      });

      if (!isDefined(workspace)) {
        return;
      }

      const workspaceMembers =
        await this.userService.loadWorkspaceMembers(workspace);

      for (const workspaceMember of workspaceMembers) {
        await this.sendReminderEmail({
          workspaceMember,
          workspaceDisplayName: workspace.displayName,
          reminder,
        });
      }

      await this.userVarsService.set({
        workspaceId,
        key: sentKey,
        value: boundaryValue,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send ${reminder.type} reminder for workspace ${workspaceId}: ${error}`,
      );
    }
  }

  private async sendReminderEmail({
    workspaceMember,
    workspaceDisplayName,
    reminder,
  }: {
    workspaceMember: WorkspaceMemberWorkspaceEntity;
    workspaceDisplayName: string | undefined;
    reminder: BillingReminderEmail;
  }): Promise<void> {
    if (!isDefined(workspaceMember.userEmail)) {
      return;
    }

    const userName = `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`;
    const locale = workspaceMember.locale;
    const i18n = this.i18nService.getI18nInstance(locale);

    const { emailTemplate, subject } = this.buildReminderEmail({
      reminder,
      userName,
      workspaceDisplayName,
      locale,
    });

    const html = await render(emailTemplate, { pretty: true });
    const text = await render(emailTemplate, { plainText: true });

    await this.emailService.send({
      to: workspaceMember.userEmail,
      from: `${this.twentyConfigService.get(
        'EMAIL_FROM_NAME',
      )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
      subject: i18n._(subject),
      html,
      text,
    });
  }

  private buildReminderEmail({
    reminder,
    userName,
    workspaceDisplayName,
    locale,
  }: {
    reminder: BillingReminderEmail;
    userName: string;
    workspaceDisplayName: string | undefined;
    locale: WorkspaceMemberWorkspaceEntity['locale'];
  }) {
    switch (reminder.type) {
      case 'trial-ending':
        return {
          subject: msg`Your trial ends tomorrow`,
          emailTemplate: BillingTrialEndingEmail({
            userName,
            workspaceDisplayName,
            trialEndsAt: reminder.trialEndsAt,
            dataRetentionDays: this.twentyConfigService.get(
              'WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION',
            ),
            billingUrl: BILLING_REMINDER_SETTINGS_URL,
            locale,
          }),
        };
      case 'trial-converting':
        return {
          subject: msg`A heads up: your Twenty trial ends in 7 days`,
          emailTemplate: BillingTrialConvertingEmail({
            userName,
            workspaceDisplayName,
            trialEndsAt: reminder.trialEndsAt,
            interval: reminder.interval,
            billingUrl: BILLING_REMINDER_SETTINGS_URL,
            locale,
          }),
        };
      case 'subscription-renewing':
        return {
          subject: msg`Your Twenty plan renews in 7 days`,
          emailTemplate: BillingSubscriptionRenewingEmail({
            userName,
            workspaceDisplayName,
            renewsAt: reminder.renewsAt,
            billingUrl: BILLING_REMINDER_SETTINGS_URL,
            locale,
          }),
        };
    }
  }
}
