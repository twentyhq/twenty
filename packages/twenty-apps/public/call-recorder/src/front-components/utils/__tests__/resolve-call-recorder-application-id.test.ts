import { beforeEach, describe, expect, it, vi } from 'vitest';

const { metadataQuery } = vi.hoisted(() => ({
  metadataQuery: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQuery;
  },
}));

import { resolveCallRecorderApplicationId } from 'src/front-components/utils/resolve-call-recorder-application-id.util';

describe('resolveCallRecorderApplicationId', () => {
  beforeEach(() => {
    metadataQuery.mockReset();
  });

  it('shares one application lookup across concurrent saves', async () => {
    metadataQuery.mockResolvedValue({
      frontComponent: { applicationId: 'application-id' },
    });

    const firstResolution =
      resolveCallRecorderApplicationId('front-component-id');
    const secondResolution =
      resolveCallRecorderApplicationId('front-component-id');

    await expect(firstResolution).resolves.toBe('application-id');
    await expect(secondResolution).resolves.toBe('application-id');
    expect(metadataQuery).toHaveBeenCalledOnce();
  });

  it('retries the lookup after a failed resolution', async () => {
    metadataQuery
      .mockResolvedValueOnce({ frontComponent: null })
      .mockResolvedValueOnce({
        frontComponent: { applicationId: 'application-id' },
      });

    await expect(
      resolveCallRecorderApplicationId('retry-front-component-id'),
    ).rejects.toThrow('Could not resolve the call recorder application.');
    await expect(
      resolveCallRecorderApplicationId('retry-front-component-id'),
    ).resolves.toBe('application-id');

    expect(metadataQuery).toHaveBeenCalledTimes(2);
  });
});
