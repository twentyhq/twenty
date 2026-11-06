import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_EMAIL = 'tim@apple.dev';

const buildService = ({
  isPreviousCustomer,
}: {
  isPreviousCustomer: boolean;
}) => {
  const createStripeCustomer = jest.fn();
  const isPreviousCustomerMock = jest.fn(async () => isPreviousCustomer);

  const service = new BillingService(
    {} as never,
    {} as never,
    {} as never,
    {
      createStripeCustomer,
      isPreviousCustomer: isPreviousCustomerMock,
    } as never,
    {} as never,
    {} as never,
    { findOne: async () => null } as never,
  );

  return {
    service,
    createStripeCustomer,
    isPreviousCustomer: isPreviousCustomerMock,
  };
};

describe('BillingService.ensureBillingCustomer', () => {
  it('should save the partner from the link for a new customer', async () => {
    const { service, createStripeCustomer } = buildService({
      isPreviousCustomer: false,
    });

    await service.ensureBillingCustomer({
      userEmail: USER_EMAIL,
      workspaceId: WORKSPACE_ID,
      workspaceDisplayName: 'Apple',
      affiliatePartnerName: 'northwind',
    });

    expect(createStripeCustomer).toHaveBeenCalledTimes(1);
    expect(createStripeCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ affiliatePartnerName: 'northwind' }),
    );
  });

  it('should drop the partner from the link for a previous customer', async () => {
    const { service, createStripeCustomer, isPreviousCustomer } = buildService({
      isPreviousCustomer: true,
    });

    await service.ensureBillingCustomer({
      userEmail: USER_EMAIL,
      workspaceId: WORKSPACE_ID,
      workspaceDisplayName: 'Apple',
      affiliatePartnerName: 'northwind',
    });

    expect(isPreviousCustomer).toHaveBeenCalledWith({ email: USER_EMAIL });
    expect(createStripeCustomer).toHaveBeenCalledTimes(1);
    expect(createStripeCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ affiliatePartnerName: undefined }),
    );
  });

  it('should not check previous customers when there is no partner', async () => {
    const { service, isPreviousCustomer } = buildService({
      isPreviousCustomer: true,
    });

    await service.ensureBillingCustomer({
      userEmail: USER_EMAIL,
      workspaceId: WORKSPACE_ID,
      workspaceDisplayName: 'Apple',
    });

    expect(isPreviousCustomer).not.toHaveBeenCalled();
  });
});
