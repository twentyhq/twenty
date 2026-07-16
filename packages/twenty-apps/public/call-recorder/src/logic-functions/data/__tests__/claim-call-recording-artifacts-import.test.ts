import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  claimCallRecordingArtifactsImport,
  releaseCallRecordingArtifactsImportClaim,
} from 'src/logic-functions/data/claim-call-recording-artifacts-import.util';

const mutationMock = vi.fn();

const client = { mutation: mutationMock } as unknown as CoreApiClient;

describe('claimCallRecordingArtifactsImport', () => {
  beforeEach(() => {
    mutationMock.mockReset();
  });

  it('claims when no fresh lease is held and stamps the lease timestamp', async () => {
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: 'call-recording-1' }],
    });

    const claimed = await claimCallRecordingArtifactsImport(client, {
      callRecordingId: 'call-recording-1',
      now: new Date('2026-01-01T14:06:00.000Z'),
    });

    expect(claimed).toBe(true);
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            or: [
              { artifactsImportClaimedAt: { is: 'NULL' } },
              { artifactsImportClaimedAt: { lte: '2026-01-01T13:56:00.000Z' } },
            ],
          },
          data: { artifactsImportClaimedAt: '2026-01-01T14:06:00.000Z' },
        },
        id: true,
      },
    });
  });

  it('does not claim when a fresh lease already blocks the update', async () => {
    mutationMock.mockResolvedValue({ updateCallRecordings: [] });

    const claimed = await claimCallRecordingArtifactsImport(client, {
      callRecordingId: 'call-recording-1',
      now: new Date('2026-01-01T14:06:00.000Z'),
    });

    expect(claimed).toBe(false);
  });

  it('reclaims a lease older than the TTL', async () => {
    // Emulate the DB-side filter so the lte staleBefore branch and TTL math are exercised.
    const storedClaimedAt = '2026-01-01T13:45:00.000Z'; // 21 minutes before now
    mutationMock.mockImplementation(async (mutation: any) => {
      const { filter } = mutation.updateCallRecordings.__args;
      const staleBefore = filter.or[1].artifactsImportClaimedAt.lte;
      const matches = storedClaimedAt <= staleBefore;

      return { updateCallRecordings: matches ? [{ id: filter.id.eq }] : [] };
    });

    const claimed = await claimCallRecordingArtifactsImport(client, {
      callRecordingId: 'call-recording-1',
      now: new Date('2026-01-01T14:06:00.000Z'),
    });

    expect(claimed).toBe(true);
    expect(
      mutationMock.mock.calls[0][0].updateCallRecordings.__args.data,
    ).toEqual({ artifactsImportClaimedAt: '2026-01-01T14:06:00.000Z' });
  });

  it('does not reclaim a lease still within the TTL', async () => {
    const storedClaimedAt = '2026-01-01T14:02:00.000Z'; // 4 minutes before now
    mutationMock.mockImplementation(async (mutation: any) => {
      const { filter } = mutation.updateCallRecordings.__args;
      const staleBefore = filter.or[1].artifactsImportClaimedAt.lte;
      const matches = storedClaimedAt <= staleBefore;

      return { updateCallRecordings: matches ? [{ id: filter.id.eq }] : [] };
    });

    const claimed = await claimCallRecordingArtifactsImport(client, {
      callRecordingId: 'call-recording-1',
      now: new Date('2026-01-01T14:06:00.000Z'),
    });

    expect(claimed).toBe(false);
  });

  it('releases the lease by clearing the timestamp', async () => {
    mutationMock.mockResolvedValue({
      updateCallRecording: { id: 'call-recording-1' },
    });

    await releaseCallRecordingArtifactsImportClaim(client, {
      callRecordingId: 'call-recording-1',
    });

    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: 'call-recording-1',
          data: { artifactsImportClaimedAt: null },
        },
        id: true,
      },
    });
  });
});
