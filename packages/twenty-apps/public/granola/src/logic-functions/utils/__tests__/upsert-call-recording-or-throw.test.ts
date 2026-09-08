import { type CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

const CALL_RECORDING_ID = 'c4c893ca-3099-4b11-8c50-0c823bb24f36';
const EMPTY_RECORDINGS = { callRecordings: { edges: [] } };
const EXISTING_RECORDINGS = {
  callRecordings: { edges: [{ node: { id: CALL_RECORDING_ID } }] },
};

const buildCoreApiClient = (): Pick<CoreApiClient, 'query'> => ({
  query: vi.fn().mockResolvedValue(EMPTY_RECORDINGS),
});

describe('upsertCallRecordingOrThrow', () => {
  beforeEach(() => {
    vi.spyOn(RestApiClient.prototype, 'post').mockResolvedValue({});
    vi.spyOn(RestApiClient.prototype, 'patch').mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    new RestApiClientError('Duplicate recording', { status: 409 }),
    new Error('Response lost after the server committed the recording'),
  ])('recovers a newly visible record after $message', async (error) => {
    const coreApiClient = buildCoreApiClient();

    vi.mocked(coreApiClient.query)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EXISTING_RECORDINGS);
    vi.mocked(RestApiClient.prototype.post).mockRejectedValueOnce(error);

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        fields: { title: 'Customer call' },
      }),
    ).resolves.toEqual({ callRecordingId: CALL_RECORDING_ID, created: false });
    expect(RestApiClient.prototype.patch).toHaveBeenCalledWith(
      `/rest/callRecordings/${CALL_RECORDING_ID}`,
      { title: 'Customer call' },
    );
  });

  it.each([400, 403, 409])(
    'propagates HTTP %s when no record exists after the failed create',
    async (status) => {
      const error = new RestApiClientError('Create failed', { status });

      vi.mocked(RestApiClient.prototype.post).mockRejectedValueOnce(error);

      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient: buildCoreApiClient(),
          callRecordingId: CALL_RECORDING_ID,
          fields: { title: 'Customer call' },
        }),
      ).rejects.toBe(error);
      expect(RestApiClient.prototype.patch).not.toHaveBeenCalled();
    },
  );

  it('propagates a failed recovery update instead of reporting success', async () => {
    const coreApiClient = buildCoreApiClient();
    const updateError = new RestApiClientError('Invalid fields', {
      status: 400,
    });

    vi.mocked(coreApiClient.query)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EMPTY_RECORDINGS)
      .mockResolvedValueOnce(EXISTING_RECORDINGS);
    vi.mocked(RestApiClient.prototype.post).mockRejectedValueOnce(
      new RestApiClientError('Duplicate recording', { status: 409 }),
    );
    vi.mocked(RestApiClient.prototype.patch).mockRejectedValueOnce(updateError);

    await expect(
      upsertCallRecordingOrThrow({
        coreApiClient,
        callRecordingId: CALL_RECORDING_ID,
        fields: { title: 'Customer call' },
      }),
    ).rejects.toBe(updateError);
  });
});
