import { transformStripeSubscriptionEventToCustomerRepositoryData } from 'src/engine/core-modules/billing/utils/transform-stripe-subscription-event-to-customer-repository-data.util';

describe('transformStripeSubscriptionEventToCustomerRepositoryData', () => {
  const mockWorkspaceId = 'workspace_123';
  const mockTimestamp = 1672531200; // 2023-01-01 00:00:00 UTC

  const createMockSubscriptionData = (overrides = {}) => ({
    object: {
      id: 'sub_123',
      customer: 'cus_123',
      status: 'active',
      items: {
        data: [
          {
            plan: {
              interval: 'month',
            },
          },
        ],
      },
      cancel_at_period_end: false,
      currency: 'usd',
      current_period_end: mockTimestamp,
      current_period_start: mockTimestamp - 2592000, // 30 days before end
      metadata: {},
      collection_method: 'charge_automatically',
      automatic_tax: null,
      cancellation_details: null,
      ended_at: null,
      trial_start: null,
      trial_end: null,
      cancel_at: null,
      canceled_at: null,
      ...overrides,
    },
  });

  it('should transform basic customer data correctly', () => {
    const mockData = createMockSubscriptionData('cus_123');

    const result = transformStripeSubscriptionEventToCustomerRepositoryData(
      mockWorkspaceId,
      mockData as any,
    );

    expect(result).toEqual({
      workspaceId: 'workspace_123',
      stripeCustomerId: 'cus_123',
    });
  });

  it('should work with different subscription event types', () => {
    const mockData = createMockSubscriptionData('cus_123');

    // Test with different event types (they should all transform the same way)
    ['updated', 'created', 'deleted'].forEach(() => {
      const result = transformStripeSubscriptionEventToCustomerRepositoryData(
        mockWorkspaceId,
        mockData as any,
      );

      expect(result).toEqual({
        workspaceId: 'workspace_123',
        stripeCustomerId: 'cus_123',
      });
    });
  });

  it('should handle different workspace IDs', () => {
    const mockData = createMockSubscriptionData('cus_123');
    const testWorkspaces = ['workspace_1', 'workspace_2', 'workspace_abc'];

    testWorkspaces.forEach((testWorkspaceId) => {
      const result = transformStripeSubscriptionEventToCustomerRepositoryData(
        testWorkspaceId,
        mockData as any,
      );

      expect(result).toEqual({
        workspaceId: testWorkspaceId,
        stripeCustomerId: 'cus_123',
      });
    });
  });
});
