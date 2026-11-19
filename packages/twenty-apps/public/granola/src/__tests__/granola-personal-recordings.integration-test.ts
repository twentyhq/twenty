import { randomUUID } from 'node:crypto';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it } from 'vitest';

import { upsertCallRecordingOrThrow } from 'src/logic-functions/utils/upsert-call-recording-or-throw.util';

describe('Granola personal recordings', () => {
  it('applies newer personal edits until workspace sync owns the recording', async () => {
    const coreApiClient = new CoreApiClient();
    const callRecordingId = randomUUID();

    try {
      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId,
          fields: {
            title: 'Personal import',
            granolaPersonalNoteUpdatedAt: '2026-11-18T12:00:00Z',
          },
        }),
      ).resolves.toMatchObject({ created: true });

      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId,
          fields: {
            title: 'Newer personal edit',
            granolaPersonalNoteUpdatedAt: '2026-11-18T12:05:00Z',
          },
        }),
      ).resolves.toEqual({ callRecordingId, created: false });

      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId,
          fields: {
            title: 'Older personal edit',
            granolaPersonalNoteUpdatedAt: '2026-11-18T12:02:00Z',
          },
        }),
      ).resolves.toMatchObject({ skipped: true });

      await Promise.all([
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId,
          fields: {
            title: 'Concurrent personal edit',
            granolaPersonalNoteUpdatedAt: '2026-11-18T12:10:00Z',
          },
        }),
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId,
          fields: {
            title: 'Workspace import',
            granolaPersonalNoteUpdatedAt: null,
          },
        }),
      ]);

      await expect(
        upsertCallRecordingOrThrow({
          coreApiClient,
          callRecordingId,
          fields: {
            title: 'Later personal edit',
            granolaPersonalNoteUpdatedAt: '2026-11-18T12:15:00Z',
          },
        }),
      ).resolves.toMatchObject({ skipped: true });

      const { callRecording } = await coreApiClient.query({
        callRecording: {
          __args: { filter: { id: { eq: callRecordingId } } },
          title: true,
        },
      });

      expect(callRecording?.title).toBe('Workspace import');
    } finally {
      await coreApiClient.mutation({
        destroyCallRecordings: {
          __args: { filter: { id: { eq: callRecordingId } } },
          id: true,
        },
      });
    }
  });
});
