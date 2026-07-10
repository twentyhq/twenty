import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.hoisted(() => vi.fn());
const FakeRestApiClientError = vi.hoisted(
  () =>
    class FakeRestApiClientError extends Error {
      constructor(
        message: string,
        readonly status?: number,
      ) {
        super(message);
      }
    },
);

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    post = postMock;
  },
  RestApiClientError: FakeRestApiClientError,
}));

import { requestAppBillingCharge } from 'src/logic-functions/data/request-app-billing-charge.util';

const CHARGE_REQUEST = {
  creditsUsedMicro: 500_000,
  quantity: 30,
  operationType: 'CALL_RECORDING',
  resourceContext: 'recall',
};

describe('requestAppBillingCharge', () => {
  beforeEach(() => {
    postMock.mockReset();
    postMock.mockResolvedValue(undefined);
  });

  it('posts the charge to the app billing endpoint and reports it charged', async () => {
    const chargeOutcome = await requestAppBillingCharge(CHARGE_REQUEST);

    expect(chargeOutcome).toBe('charged');
    expect(postMock).toHaveBeenCalledWith(
      '/app/billing/charge',
      CHARGE_REQUEST,
      { signal: expect.any(AbortSignal) },
    );
  });

  it('reports billing disabled on a 404 so community instances still complete', async () => {
    postMock.mockRejectedValue(new FakeRestApiClientError('not found', 404));

    expect(await requestAppBillingCharge(CHARGE_REQUEST)).toBe(
      'billing-disabled',
    );
  });

  it('reports a definite rejection on client HTTP failures', async () => {
    postMock.mockRejectedValue(new FakeRestApiClientError('throttled', 429));

    expect(await requestAppBillingCharge(CHARGE_REQUEST)).toBe('rejected');
  });

  it('reports a definite rejection when client setup fails before sending', async () => {
    postMock.mockRejectedValue(
      new FakeRestApiClientError('missing application access token'),
    );

    expect(await requestAppBillingCharge(CHARGE_REQUEST)).toBe('rejected');
  });

  it('reports unknown on server errors because the charge may have landed', async () => {
    postMock.mockRejectedValue(
      new FakeRestApiClientError('service unavailable', 503),
    );

    expect(await requestAppBillingCharge(CHARGE_REQUEST)).toBe('unknown');
  });

  it('reports unknown when no HTTP status proves the charge was dropped', async () => {
    postMock.mockRejectedValue(new Error('socket hang up'));

    expect(await requestAppBillingCharge(CHARGE_REQUEST)).toBe('unknown');
  });
});
