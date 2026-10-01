import { describe, expect, it } from 'vitest';

import { parseUnrecoverableMediaMarkers } from 'src/logic-functions/domain/parse-unrecoverable-media-markers.util';

describe('parseUnrecoverableMediaMarkers', () => {
  it('parses single-artifact size markers', () => {
    expect(parseUnrecoverableMediaMarkers('video_file_too_large')).toEqual({
      isAudioUnrecoverable: false,
      isVideoUnrecoverable: true,
    });
    expect(parseUnrecoverableMediaMarkers('audio_file_too_large')).toEqual({
      isAudioUnrecoverable: true,
      isVideoUnrecoverable: false,
    });
  });

  it('parses single-artifact expiry markers', () => {
    expect(parseUnrecoverableMediaMarkers('video_import_expired')).toEqual({
      isAudioUnrecoverable: false,
      isVideoUnrecoverable: true,
    });
    expect(parseUnrecoverableMediaMarkers('audio_import_expired')).toEqual({
      isAudioUnrecoverable: true,
      isVideoUnrecoverable: false,
    });
  });

  it('parses comma-joined markers of mixed kinds', () => {
    expect(
      parseUnrecoverableMediaMarkers(
        'audio_file_too_large,video_import_expired',
      ),
    ).toEqual({
      isAudioUnrecoverable: true,
      isVideoUnrecoverable: true,
    });
  });

  it('reports no markers for unset or unrelated reasons', () => {
    expect(parseUnrecoverableMediaMarkers(undefined)).toEqual({
      isAudioUnrecoverable: false,
      isVideoUnrecoverable: false,
    });
    expect(parseUnrecoverableMediaMarkers(null)).toEqual({
      isAudioUnrecoverable: false,
      isVideoUnrecoverable: false,
    });
    expect(parseUnrecoverableMediaMarkers('')).toEqual({
      isAudioUnrecoverable: false,
      isVideoUnrecoverable: false,
    });
    expect(parseUnrecoverableMediaMarkers('recall_bot_not_found')).toEqual({
      isAudioUnrecoverable: false,
      isVideoUnrecoverable: false,
    });
  });
});
