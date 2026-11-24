import { BillingEmailService } from 'src/engine/core-modules/billing/services/billing-email.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const buildService = ({
  hasBillingCustomer = true,
  stripeEmail = 'tim@apple.dev',
  isMemberEmail = true,
}: {
  hasBillingCustomer?: boolean;
  stripeEmail?: string | null;
  isMemberEmail?: boolean;
} = {}) => {
  const getCustomerPartnerAndEmail = jest.fn(async () => ({
    partner: null,
    email: stripeEmail,
  }));
  const exists = jest.fn(async () => isMemberEmail);

  const service = new BillingEmailService(
    { getCustomerPartnerAndEmail } as never,
    {
      findOne: async () =>
        hasBillingCustomer ? { stripeCustomerId: 'cus_123' } : null,
    } as never,
    { exists } as never,
  );

  return { service, getCustomerPartnerAndEmail, exists };
};

describe('BillingEmailService', () => {
  it('should return no email without asking Stripe when the workspace has no billing customer', async () => {
    const { service, getCustomerPartnerAndEmail } = buildService({
      hasBillingCustomer: false,
    });

    await expect(service.getBillingEmail(WORKSPACE_ID)).resolves.toEqual({
      email: null,
      belongsToWorkspaceMember: false,
    });
    expect(getCustomerPartnerAndEmail).not.toHaveBeenCalled();
  });

  it('should return no email when the Stripe customer has none', async () => {
    const { service, exists } = buildService({ stripeEmail: null });

    await expect(service.getBillingEmail(WORKSPACE_ID)).resolves.toEqual({
      email: null,
      belongsToWorkspaceMember: false,
    });
    expect(exists).not.toHaveBeenCalled();
  });

  it('should flag a billing email that matches no workspace member', async () => {
    const { service } = buildService({
      stripeEmail: 'jane@acme.com',
      isMemberEmail: false,
    });

    await expect(service.getBillingEmail(WORKSPACE_ID)).resolves.toEqual({
      email: 'jane@acme.com',
      belongsToWorkspaceMember: false,
    });
  });
});
