import { describe, expect, it, vi } from 'vitest';

import { doesCallRecordingHaveSpeakerNamesOrThrow } from 'src/features/transcripts/logic-functions/utils/does-call-recording-have-speaker-names-or-throw';

const buildQuery = (ids: string[]) =>
  vi.fn().mockResolvedValue({
    callRecordings: { edges: ids.map((id) => ({ node: { id } })) },
  });

describe('doesCallRecordingHaveSpeakerNamesOrThrow', () => {
  it('should match the recording on a named participant in its transcript', async () => {
    const query = buildQuery(['call-recording-1']);

    await expect(
      doesCallRecordingHaveSpeakerNamesOrThrow({
        coreApiClient: { query },
        callRecordingId: 'call-recording-1',
      }),
    ).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith({
      callRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            transcript: { like: '%"participant": {"name": "%' },
          },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    });
  });

  it('should return false when the server matches nothing', async () => {
    await expect(
      doesCallRecordingHaveSpeakerNamesOrThrow({
        coreApiClient: { query: buildQuery([]) },
        callRecordingId: 'call-recording-1',
      }),
    ).resolves.toBe(false);
  });
});
