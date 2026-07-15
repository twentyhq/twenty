import { describe, expect, it } from 'vitest';

import { RestApiClientError } from 'twenty-client-sdk/rest';

import { classifyAppBillingChargeFailure } from 'src/logic-functions/data/classify-app-billing-charge-failure.util';

describe('classifyAppBillingChargeFailure', () => {
  it('treats a 404 as billing disabled on the instance', () => {
    const error = new RestApiClientError('Not Found', { status: 404 });

    expect(classifyAppBillingChargeFailure(error)).toBe('billing-disabled');
  });

  it('treats a 4xx as a definite rejection', () => {
    const error = new RestApiClientError('Too Many Requests', { status: 429 });

    expect(classifyAppBillingChargeFailure(error)).toBe('rejected');
  });

  it('treats a client error without a status as a definite rejection', () => {
    const error = new RestApiClientError('Missing API url.');

    expect(classifyAppBillingChargeFailure(error)).toBe('rejected');
  });

  it('treats a 5xx as unknown because the charge may have landed', () => {
    const error = new RestApiClientError('Service Unavailable', {
      status: 503,
    });

    expect(classifyAppBillingChargeFailure(error)).toBe('unknown');
  });

  it('treats a network failure as unknown because the charge may have landed', () => {
    expect(classifyAppBillingChargeFailure(new Error('socket hang up'))).toBe(
      'unknown',
    );
  });
});
