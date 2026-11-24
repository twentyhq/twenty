import { BillingEmailService } from 'src/engine/core-modules/billing/services/billing-email.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const buildService = ({
  hasBillingCustomer = true,
  stripeEmail = 'tim@apple.dev',
}: {
  hasBillingCustomer?: boolean;
  stripeEmail?: string | null;
} = {}) => {
  const getCustomerPartnerAndEmail = jest.fn(async () => ({
    partner: null,
    email: stripeEmail,
  }));

  const service = new BillingEmailService(
    { getCustomerPartnerAndEmail } as never,
    {
      findOne: async () =>
        hasBillingCustomer ? { stripeCustomerId: 'cus_123' } : null,
    } as never,
  );

  return { service, getCustomerPartnerAndEmail };
};

describe('BillingEmailService', () => {
  it('should return the email of the Stripe customer', async () => {
    const { service } = buildService();

    await expect(service.getBillingEmail(WORKSPACE_ID)).resolves.toBe(
      'tim@apple.dev',
    );
  });

  it('should return no email without asking Stripe when the workspace has no billing customer', async () => {
    const { service, getCustomerPartnerAndEmail } = buildService({
      hasBillingCustomer: false,
    });

    await expect(service.getBillingEmail(WORKSPACE_ID)).resolves.toBeNull();
    expect(getCustomerPartnerAndEmail).not.toHaveBeenCalled();
  });

  it('should return no email when the Stripe customer has none', async () => {
    const { service } = buildService({ stripeEmail: '' });

    await expect(service.getBillingEmail(WORKSPACE_ID)).resolves.toBeNull();
  });
});
