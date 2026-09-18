import { beforeEach, describe, expect, it, vi } from 'vitest';

const { metadataQuery } = vi.hoisted(() => ({
  metadataQuery: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQuery;
  },
}));

describe('resolveCallRecorderApplicationId', () => {
  beforeEach(() => {
    vi.resetModules();
    metadataQuery.mockReset();
  });

  const importResolver = async () => {
    const module =
      await import('src/front-components/utils/resolve-call-recorder-application-id.util');

    return module.resolveCallRecorderApplicationId;
  };

  it('shares one application lookup across concurrent saves', async () => {
    metadataQuery.mockResolvedValue({
      findOneApplication: { id: 'application-id' },
    });

    const resolveCallRecorderApplicationId = await importResolver();

    const firstResolution = resolveCallRecorderApplicationId();
    const secondResolution = resolveCallRecorderApplicationId();

    await expect(firstResolution).resolves.toBe('application-id');
    await expect(secondResolution).resolves.toBe('application-id');
    expect(metadataQuery).toHaveBeenCalledOnce();
  });

  it('retries the lookup after a failed resolution', async () => {
    metadataQuery
      .mockResolvedValueOnce({ findOneApplication: null })
      .mockResolvedValueOnce({ findOneApplication: { id: 'application-id' } });

    const resolveCallRecorderApplicationId = await importResolver();

    await expect(resolveCallRecorderApplicationId()).rejects.toThrow(
      'Could not resolve the call recorder application.',
    );
    await expect(resolveCallRecorderApplicationId()).resolves.toBe(
      'application-id',
    );

    expect(metadataQuery).toHaveBeenCalledTimes(2);
  });
});
