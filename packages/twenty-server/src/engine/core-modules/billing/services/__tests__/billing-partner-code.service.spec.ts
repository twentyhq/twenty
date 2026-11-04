import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { BillingPartnerCodeService } from 'src/engine/core-modules/billing/services/billing-partner-code.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STRIPE_CUSTOMER_ID = 'cus_123';
const CUSTOMER_EMAIL = 'tim@apple.dev';

const buildService = ({
  existingPartnerCode = null,
  isPreviousCustomer = false,
  subscriptionStatus = SubscriptionStatus.Trialing,
}: {
  existingPartnerCode?: string | null;
  isPreviousCustomer?: boolean;
  subscriptionStatus?: SubscriptionStatus | null;
} = {}) => {
  const updateCustomerPartner = jest.fn();
  const isPreviousCustomerMock = jest.fn(async () => isPreviousCustomer);

  const service = new BillingPartnerCodeService(
    {
      getCustomerPartnerAndEmail: async () => ({
        partner: existingPartnerCode,
        email: CUSTOMER_EMAIL,
      }),
      isPreviousCustomer: isPreviousCustomerMock,
      updateCustomerPartner,
    } as never,
    {
      getCurrentBillingSubscription: async () =>
        subscriptionStatus === null
          ? undefined
          : { status: subscriptionStatus },
    } as never,
    {
      findOne: async () => ({ stripeCustomerId: STRIPE_CUSTOMER_ID }),
    } as never,
  );

  return {
    service,
    updateCustomerPartner,
    isPreviousCustomer: isPreviousCustomerMock,
  };
};

describe('BillingPartnerCodeService', () => {
  it('should lock a code that is already set', async () => {
    const { service } = buildService({ existingPartnerCode: 'northwind' });

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: 'northwind',
      isEditable: false,
    });
  });

  it('should let a code be added while none is set, without checking previous customers', async () => {
    const { service, isPreviousCustomer } = buildService();

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: null,
      isEditable: true,
    });
    expect(isPreviousCustomer).not.toHaveBeenCalled();
  });

  it('should not let a code be added once the subscription is past trial', async () => {
    const { service } = buildService({
      subscriptionStatus: SubscriptionStatus.Active,
    });

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: null,
      isEditable: false,
    });
  });

  it('should let a code be added without a subscription', async () => {
    const { service } = buildService({ subscriptionStatus: null });

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: null,
      isEditable: true,
    });
  });

  it('should store the normalized code on the Stripe customer', async () => {
    const { service, updateCustomerPartner, isPreviousCustomer } =
      buildService();

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: ' Acme ',
      }),
    ).resolves.toEqual({ partnerCode: 'acme', isEditable: false });
    expect(isPreviousCustomer).toHaveBeenCalledTimes(1);
    expect(isPreviousCustomer).toHaveBeenCalledWith({
      email: CUSTOMER_EMAIL,
      currentStripeCustomerId: STRIPE_CUSTOMER_ID,
    });
    expect(updateCustomerPartner).toHaveBeenCalledTimes(1);
    expect(updateCustomerPartner).toHaveBeenCalledWith(
      STRIPE_CUSTOMER_ID,
      'acme',
    );
  });

  it('should refuse to replace a code that is already set', async () => {
    const { service, updateCustomerPartner } = buildService({
      existingPartnerCode: 'northwind',
    });

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: 'acme',
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
    });
    expect(updateCustomerPartner).not.toHaveBeenCalled();
  });

  it('should refuse a code once the subscription is past trial', async () => {
    const { service, updateCustomerPartner } = buildService({
      subscriptionStatus: SubscriptionStatus.Active,
    });

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: 'acme',
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
    });
    expect(updateCustomerPartner).not.toHaveBeenCalled();
  });

  it('should store a code without a subscription', async () => {
    const { service, updateCustomerPartner } = buildService({
      subscriptionStatus: null,
    });

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: 'acme',
      }),
    ).resolves.toEqual({ partnerCode: 'acme', isEditable: false });
    expect(updateCustomerPartner).toHaveBeenCalledWith(
      STRIPE_CUSTOMER_ID,
      'acme',
    );
  });

  it('should refuse a code for a previous customer', async () => {
    const { service, updateCustomerPartner } = buildService({
      isPreviousCustomer: true,
    });

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: 'acme',
      }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PARTNER_CODE_NOT_ELIGIBLE,
    });
    expect(updateCustomerPartner).not.toHaveBeenCalled();
  });

  it('should refuse a malformed code', async () => {
    const { service } = buildService();

    await expect(
      service.setPartnerCode({ workspaceId: WORKSPACE_ID, partnerCode: '<x>' }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PARTNER_CODE_INVALID,
    });
  });
});
