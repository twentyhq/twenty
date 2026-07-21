import { describe, expect, it } from 'vitest';

import { parseMediaFileTooLargeMarkers } from 'src/logic-functions/domain/parse-media-file-too-large-markers.util';

describe('parseMediaFileTooLargeMarkers', () => {
  it('parses single-artifact markers', () => {
    expect(parseMediaFileTooLargeMarkers('video_file_too_large')).toEqual({
      audioFileTooLarge: false,
      videoFileTooLarge: true,
    });
    expect(parseMediaFileTooLargeMarkers('audio_file_too_large')).toEqual({
      audioFileTooLarge: true,
      videoFileTooLarge: false,
    });
  });

  it('parses comma-joined markers for both artifacts', () => {
    expect(
      parseMediaFileTooLargeMarkers(
        'video_file_too_large,audio_file_too_large',
      ),
    ).toEqual({
      audioFileTooLarge: true,
      videoFileTooLarge: true,
    });
  });

  it('reports no markers for unset or unrelated reasons', () => {
    expect(parseMediaFileTooLargeMarkers(undefined)).toEqual({
      audioFileTooLarge: false,
      videoFileTooLarge: false,
    });
    expect(parseMediaFileTooLargeMarkers(null)).toEqual({
      audioFileTooLarge: false,
      videoFileTooLarge: false,
    });
    expect(parseMediaFileTooLargeMarkers('')).toEqual({
      audioFileTooLarge: false,
      videoFileTooLarge: false,
    });
    expect(parseMediaFileTooLargeMarkers('recall_bot_not_found')).toEqual({
      audioFileTooLarge: false,
      videoFileTooLarge: false,
    });
  });
});
