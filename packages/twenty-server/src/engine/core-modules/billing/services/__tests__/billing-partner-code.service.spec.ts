import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPartnerCodeService } from 'src/engine/core-modules/billing/services/billing-partner-code.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STRIPE_CUSTOMER_ID = 'cus_123';
const CUSTOMER_EMAIL = 'tim@apple.dev';

const buildService = ({
  existingPartnerCode = null,
  isPreviousPayingCustomer = false,
}: {
  existingPartnerCode?: string | null;
  isPreviousPayingCustomer?: boolean;
} = {}) => {
  const updateCustomerPartner = jest.fn();
  const isPreviousPayingCustomerMock = jest.fn(
    async () => isPreviousPayingCustomer,
  );

  const service = new BillingPartnerCodeService(
    {
      getCustomerPartnerAndEmail: async () => ({
        partner: existingPartnerCode,
        email: CUSTOMER_EMAIL,
      }),
      isPreviousPayingCustomer: isPreviousPayingCustomerMock,
      updateCustomerPartner,
    } as never,
    {
      findOne: async () => ({ stripeCustomerId: STRIPE_CUSTOMER_ID }),
    } as never,
  );

  return {
    service,
    updateCustomerPartner,
    isPreviousPayingCustomer: isPreviousPayingCustomerMock,
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

  it('should let a code be added while none is set, without checking past payments', async () => {
    const { service, isPreviousPayingCustomer } = buildService();

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: null,
      isEditable: true,
    });
    expect(isPreviousPayingCustomer).not.toHaveBeenCalled();
  });

  it('should store the normalized code on the Stripe customer', async () => {
    const { service, updateCustomerPartner, isPreviousPayingCustomer } =
      buildService();

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: ' Acme ',
      }),
    ).resolves.toEqual({ partnerCode: 'acme', isEditable: false });
    expect(isPreviousPayingCustomer).toHaveBeenCalledTimes(1);
    expect(isPreviousPayingCustomer).toHaveBeenCalledWith(CUSTOMER_EMAIL);
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

  it('should refuse a code for a previous paying customer', async () => {
    const { service, updateCustomerPartner } = buildService({
      isPreviousPayingCustomer: true,
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
