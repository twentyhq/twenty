import { describe, expect, it } from 'vitest';

import { buildExpiredMediaImportUpdate } from 'src/logic-functions/domain/build-expired-media-import-update.util';

describe('buildExpiredMediaImportUpdate', () => {
  it.each(['audio', 'video'] as const)(
    'leaves the other artifact unresolved when %s sees source expiry',
    (scope) => {
      expect(
        buildExpiredMediaImportUpdate({
          audio: undefined,
          video: undefined,
          callRecorderFailureReason: undefined,
          scope,
        }),
      ).toEqual({ callRecorderFailureReason: `${scope}_import_expired` });
    },
  );

  it('keeps a saved video failure when a later audio import expires', () => {
    expect(
      buildExpiredMediaImportUpdate({
        audio: undefined,
        video: undefined,
        callRecorderFailureReason: 'video_import_failed',
        scope: 'audio',
      }),
    ).toEqual({
      callRecorderFailureReason: 'video_import_failed,audio_import_expired',
    });
  });

  it('leaves stored audio untouched when the video expires', () => {
    expect(
      buildExpiredMediaImportUpdate({
        audio: [{ fileId: 'saved-audio' }],
        video: undefined,
        callRecorderFailureReason: undefined,
        scope: 'video',
      }),
    ).toEqual({ callRecorderFailureReason: 'video_import_expired' });
  });
});
