import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { BillingPartnerCodeService } from 'src/engine/core-modules/billing/services/billing-partner-code.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STRIPE_CUSTOMER_ID = 'cus_123';

const buildService = ({
  hasPaidInvoice = false,
  existingPartnerCode = null,
}: {
  hasPaidInvoice?: boolean;
  existingPartnerCode?: string | null;
} = {}) => {
  const updateCustomerPartner = jest.fn();

  const service = new BillingPartnerCodeService(
    {
      getCustomerPartner: async () => existingPartnerCode,
      updateCustomerPartner,
    } as never,
    { hasPaidInvoice: async () => hasPaidInvoice } as never,
    {
      findOne: async () => ({ stripeCustomerId: STRIPE_CUSTOMER_ID }),
    } as never,
  );

  return { service, updateCustomerPartner };
};

describe('BillingPartnerCodeService', () => {
  it('should lock a code that is already set', async () => {
    const { service } = buildService({ existingPartnerCode: 'northwind' });

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: 'northwind',
      isEditable: false,
    });
  });

  it('should let a code be added while none is set and nothing is paid', async () => {
    const { service } = buildService();

    await expect(service.getPartnerCode(WORKSPACE_ID)).resolves.toEqual({
      partnerCode: null,
      isEditable: true,
    });
  });

  it('should store the normalized code on the Stripe customer', async () => {
    const { service, updateCustomerPartner } = buildService();

    await expect(
      service.setPartnerCode({
        workspaceId: WORKSPACE_ID,
        partnerCode: ' Acme ',
      }),
    ).resolves.toEqual({ partnerCode: 'acme', isEditable: false });
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
      service.setPartnerCode({ workspaceId: WORKSPACE_ID, partnerCode: 'acme' }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
    });
    expect(updateCustomerPartner).not.toHaveBeenCalled();
  });

  it('should refuse a new code after the first payment', async () => {
    const { service, updateCustomerPartner } = buildService({
      hasPaidInvoice: true,
    });

    await expect(
      service.setPartnerCode({ workspaceId: WORKSPACE_ID, partnerCode: 'acme' }),
    ).rejects.toMatchObject({
      code: BillingExceptionCode.BILLING_PARTNER_CODE_LOCKED,
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
