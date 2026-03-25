/* @license Enterprise */

import { transformStripeSubscriptionEventToDatabaseSubscription } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-event-to-database-subscription.util';
import { BillingSubscriptionCollectionMethod } from 'src/engine/core-modules/billing/enums/billing-subscription-collection-method.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

describe('transformStripeSubscriptionEventToDatabaseSubscription', () => {
  const mockWorkspaceId = 'workspace-123';
  const mockTimestamp = 1672531200; // 2023-01-01 00:00:00 UTC

  const createMockSubscriptionData = (overrides = {}) => ({
    id: 'sub_123',
    customer: 'cus_123',
    status: 'active',
    items: {
      data: [
        {
          plan: {
            interval: 'month',
          },
          current_period_end: mockTimestamp,
          current_period_start: mockTimestamp - 2592000, // 30 days before end
        },
      ],
    },
    cancel_at_period_end: false,
    currency: 'usd',
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
  });

  it('should transform basic subscription data correctly', () => {
    const mockData = createMockSubscriptionData();
    const result = transformStripeSubscriptionEventToDatabaseSubscription(
      mockWorkspaceId,
      mockData as any,
    );

    expect(result).toEqual({
      workspaceId: mockWorkspaceId,
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
      status: SubscriptionStatus.Active,
      interval: 'month',
      cancelAtPeriodEnd: false,
      currency: 'USD',
      currentPeriodEnd: new Date(mockTimestamp * 1000),
      currentPeriodStart: new Date((mockTimestamp - 2592000) * 1000),
      metadata: {},
      collectionMethod:
        BillingSubscriptionCollectionMethod.CHARGE_AUTOMATICALLY,
      automaticTax: undefined,
      cancellationDetails: undefined,
      endedAt: undefined,
      trialStart: undefined,
      trialEnd: undefined,
      cancelAt: undefined,
      canceledAt: undefined,
      phases: [],
    });
  });

  it('should handle all subscription statuses correctly', () => {
    const statuses = [
      ['active', SubscriptionStatus.Active],
      ['canceled', SubscriptionStatus.Canceled],
      ['incomplete', SubscriptionStatus.Incomplete],
      ['incomplete_expired', SubscriptionStatus.IncompleteExpired],
      ['past_due', SubscriptionStatus.PastDue],
      ['paused', SubscriptionStatus.Paused],
      ['trialing', SubscriptionStatus.Trialing],
      ['unpaid', SubscriptionStatus.Unpaid],
    ];

    statuses.forEach(([stripeStatus, expectedStatus]) => {
      const mockData = createMockSubscriptionData({
        status: stripeStatus,
      });
      const result = transformStripeSubscriptionEventToDatabaseSubscription(
        mockWorkspaceId,
        mockData as any,
      );

      expect(result.status).toBe(expectedStatus);
    });
  });

  it('should handle subscription with trial periods', () => {
    const trialStart = mockTimestamp - 604800; // 7 days before
    const trialEnd = mockTimestamp + 604800; // 7 days after

    const mockData = createMockSubscriptionData({
      trial_start: trialStart,
      trial_end: trialEnd,
    });

    const result = transformStripeSubscriptionEventToDatabaseSubscription(
      mockWorkspaceId,
      mockData as any,
    );

    expect(result.trialStart).toEqual(new Date(trialStart * 1000));
    expect(result.trialEnd).toEqual(new Date(trialEnd * 1000));
  });

  it('should handle subscription cancellation details', () => {
    const cancelAt = mockTimestamp + 2592000; // 30 days after
    const canceledAt = mockTimestamp;
    const mockData = createMockSubscriptionData({
      cancel_at: cancelAt,
      canceled_at: canceledAt,
      cancel_at_period_end: true,
      cancellation_details: {
        comment: 'Customer requested cancellation',
        feedback: 'too_expensive',
        reason: 'cancellation_requested',
      },
    });

    const result = transformStripeSubscriptionEventToDatabaseSubscription(
      mockWorkspaceId,
      mockData as any,
    );

    expect(result.cancelAt).toEqual(new Date(cancelAt * 1000));
    expect(result.canceledAt).toEqual(new Date(canceledAt * 1000));
    expect(result.cancelAtPeriodEnd).toBe(true);
    expect(result.cancellationDetails).toEqual({
      comment: 'Customer requested cancellation',
      feedback: 'too_expensive',
      reason: 'cancellation_requested',
    });
  });

  it('should handle automatic tax information', () => {
    const mockData = createMockSubscriptionData({
      automatic_tax: {
        enabled: true,
        disabled_reason: null,
        liability: {
          type: 'self',
          account: 'acct_123',
        },
      },
    });

    const result = transformStripeSubscriptionEventToDatabaseSubscription(
      mockWorkspaceId,
      mockData as any,
    );

    expect(result.automaticTax).toEqual({
      enabled: true,
      disabled_reason: null,
      liability: {
        type: 'self',
        account: 'acct_123',
      },
    });
  });

  it('should handle different collection methods', () => {
    const methods = [
      [
        'charge_automatically',
        BillingSubscriptionCollectionMethod.CHARGE_AUTOMATICALLY,
      ],
      ['send_invoice', BillingSubscriptionCollectionMethod.SEND_INVOICE],
    ];

    methods.forEach(([stripeMethod, expectedMethod]) => {
      const mockData = createMockSubscriptionData({
        collection_method: stripeMethod,
      });
      const result = transformStripeSubscriptionEventToDatabaseSubscription(
        mockWorkspaceId,
        mockData as any,
      );

      expect(result.collectionMethod).toBe(expectedMethod);
    });
  });

  it('should handle different currencies', () => {
    const mockData = createMockSubscriptionData({
      currency: 'eur',
    });

    const result = transformStripeSubscriptionEventToDatabaseSubscription(
      mockWorkspaceId,
      mockData as any,
    );

    expect(result.currency).toBe('EUR');
  });
});
