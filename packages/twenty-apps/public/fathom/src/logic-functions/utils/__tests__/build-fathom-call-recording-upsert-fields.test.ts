import { describe, expect, it } from 'vitest';

import { type CallRecordingMediaState } from 'src/logic-functions/types/call-recording-media-state.type';
import { type CallRecordingSyncFields } from 'src/logic-functions/types/call-recording-sync-fields.type';
import { buildFathomCallRecordingUpsertFields } from 'src/logic-functions/utils/build-fathom-call-recording-upsert-fields.util';

const buildFields = ({
  existingCallRecording,
  retryMedia = false,
  sharedFields = { transcript: [] },
}: {
  existingCallRecording?: Partial<CallRecordingMediaState>;
  retryMedia?: boolean;
  sharedFields?: CallRecordingSyncFields;
} = {}) =>
  buildFathomCallRecordingUpsertFields({
    sharedFields,
    existingCallRecording: existingCallRecording
      ? {
          hasVideo: false,
          hasAudio: false,
          hasTranscript: false,
          hasSummary: false,
          failureReason: undefined,
          downloadId: undefined,
          connectedAccountId: undefined,
          ...existingCallRecording,
        }
      : undefined,
    connectedAccountId: 'current-connected-account-id',
    retryMedia,
  });

describe('buildFathomCallRecordingUpsertFields', () => {
  it('creates new recordings in processing while media is pending', () => {
    expect(buildFields().createFields).toEqual({
      transcript: [],
      fathomConnectedAccountId: 'current-connected-account-id',
      status: 'PROCESSING',
    });
  });

  it('does not move an existing recording back to processing automatically', () => {
    expect(buildFields().updateFields).not.toHaveProperty('status');
  });

  it('does not request an automatic retry for settled media', () => {
    const fields = buildFields({
      existingCallRecording: {
        failureReason: 'download_forbidden',
        connectedAccountId: 'connected-account-id',
      },
    });

    expect(fields.isMediaDownloadRequestNeeded).toBe(false);
  });

  it('reopens a settled failure only for an explicit media retry', () => {
    const fields = buildFields({
      retryMedia: true,
      existingCallRecording: {
        failureReason: 'download_forbidden',
        connectedAccountId: 'previous-connected-account-id',
      },
    });

    expect(fields.updateFields).toEqual({
      transcript: [],
      status: 'PROCESSING',
      fathomConnectedAccountId: 'current-connected-account-id',
      fathomMediaDownloadId: null,
      fathomMediaUploadCheckpoint: null,
      fathomMediaFailureReason: null,
      fathomMediaImportClaimedAt: null,
    });
    expect(fields.isMediaDownloadRequestNeeded).toBe(true);
  });

  it('keeps the owner of an active private Fathom download', () => {
    const fields = buildFields({
      existingCallRecording: {
        downloadId: 'download-id',
        connectedAccountId: 'current-connected-account-id',
      },
    });

    expect(fields.updateFields).not.toHaveProperty('fathomConnectedAccountId');
    expect(fields.isMediaDownloadRequestNeeded).toBe(false);
  });

  it('replaces a download owned by another connection', () => {
    const fields = buildFields({
      existingCallRecording: {
        downloadId: 'download-id',
        connectedAccountId: 'previous-connected-account-id',
      },
    });

    expect(fields.updateFields).toEqual({
      transcript: [],
      fathomConnectedAccountId: 'current-connected-account-id',
      fathomMediaDownloadId: null,
      fathomMediaUploadCheckpoint: null,
      fathomMediaImportClaimedAt: null,
    });
    expect(fields.isMediaDownloadRequestNeeded).toBe(true);
  });

  it.each([undefined, 'current-connected-account-id'])(
    'requests missing media after an interrupted enqueue with owner %s',
    (connectedAccountId) => {
      const fields = buildFields({
        existingCallRecording: { connectedAccountId },
      });

      expect(fields.isMediaDownloadRequestNeeded).toBe(true);
      expect(fields.updateFields).not.toHaveProperty('status');
    },
  );

  it('preserves populated transcript and summary on a repeated import', () => {
    const fields = buildFields({
      existingCallRecording: { hasTranscript: true, hasSummary: true },
      sharedFields: {
        transcript: [
          {
            participant: { name: 'Speaker' },
            words: [{ text: 'New source transcript' }],
          },
        ],
        summary: { markdown: 'New source summary', blocknote: null },
      },
    });

    expect(fields.updateFields.transcript).toBeUndefined();
    expect(fields.updateFields.summary).toBeUndefined();
  });

  it('fills an empty summary without replacing a populated transcript', () => {
    const fields = buildFields({
      existingCallRecording: { hasTranscript: true, hasSummary: false },
      sharedFields: {
        transcript: [
          {
            participant: { name: 'Speaker' },
            words: [{ text: 'New source transcript' }],
          },
        ],
        summary: { markdown: 'New source summary', blocknote: null },
      },
    });

    expect(fields.updateFields.transcript).toBeUndefined();
    expect(fields.updateFields.summary).toEqual({
      markdown: 'New source summary',
      blocknote: null,
    });
  });

  it.each([
    'download_forbidden',
    'no_downloadable_media',
    'download_expired',
    'media_file_too_large',
    'download_timed_out',
    'connected_account_unavailable',
    'completed_without_file',
  ])('does not automatically reopen terminal failure %s', (failureReason) => {
    const fields = buildFields({
      existingCallRecording: {
        connectedAccountId: 'previous-connected-account-id',
        failureReason,
      },
    });

    expect(fields.isMediaDownloadRequestNeeded).toBe(false);
    expect(fields.updateFields).not.toHaveProperty('fathomMediaFailureReason');
    expect(fields.updateFields).not.toHaveProperty('status');
  });
});
