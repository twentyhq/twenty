import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_EMAIL = 'tim@apple.dev';

const buildService = ({
  isPreviousPayingCustomer,
}: {
  isPreviousPayingCustomer: boolean;
}) => {
  const createStripeCustomer = jest.fn();
  const isPreviousPayingCustomerMock = jest.fn(
    async () => isPreviousPayingCustomer,
  );

  const service = new BillingService(
    {} as never,
    {} as never,
    {} as never,
    {
      createStripeCustomer,
      isPreviousPayingCustomer: isPreviousPayingCustomerMock,
    } as never,
    {} as never,
    {} as never,
    { findOne: async () => null } as never,
  );

  return {
    service,
    createStripeCustomer,
    isPreviousPayingCustomer: isPreviousPayingCustomerMock,
  };
};

describe('BillingService.ensureBillingCustomer', () => {
  it('should save the partner from the link for a new customer', async () => {
    const { service, createStripeCustomer } = buildService({
      isPreviousPayingCustomer: false,
    });

    await service.ensureBillingCustomer({
      userEmail: USER_EMAIL,
      workspaceId: WORKSPACE_ID,
      workspaceDisplayName: 'Apple',
      partner: 'northwind',
    });

    expect(createStripeCustomer).toHaveBeenCalledTimes(1);
    expect(createStripeCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ partner: 'northwind' }),
    );
  });

  it('should drop the partner from the link for a previous paying customer', async () => {
    const { service, createStripeCustomer, isPreviousPayingCustomer } =
      buildService({ isPreviousPayingCustomer: true });

    await service.ensureBillingCustomer({
      userEmail: USER_EMAIL,
      workspaceId: WORKSPACE_ID,
      workspaceDisplayName: 'Apple',
      partner: 'northwind',
    });

    expect(isPreviousPayingCustomer).toHaveBeenCalledWith(USER_EMAIL);
    expect(createStripeCustomer).toHaveBeenCalledTimes(1);
    expect(createStripeCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ partner: undefined }),
    );
  });

  it('should not check past payments when there is no partner', async () => {
    const { service, isPreviousPayingCustomer } = buildService({
      isPreviousPayingCustomer: true,
    });

    await service.ensureBillingCustomer({
      userEmail: USER_EMAIL,
      workspaceId: WORKSPACE_ID,
      workspaceDisplayName: 'Apple',
    });

    expect(isPreviousPayingCustomer).not.toHaveBeenCalled();
  });
});
