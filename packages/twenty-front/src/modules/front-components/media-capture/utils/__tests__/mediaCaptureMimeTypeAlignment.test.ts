import { MEDIA_CAPTURE_MIME_TYPES } from 'twenty-shared/constants';

import { getMediaCaptureFileExtension } from '@/front-components/media-capture/utils/getMediaCaptureFileExtension';
import { pickSupportedMediaRecorderMimeType } from '@/front-components/media-capture/utils/pickSupportedMediaRecorderMimeType';

// The recorder preferences (front), the extension map (front), and the
// server's upload allowlist (twenty-shared) are only coupled at runtime:
// a recorder format missing from the allowlist surfaces as an upload-failed
// capture. This test turns that silent drift into a review-time failure.
describe('media capture mime type alignment', () => {
  const collectPreferredMimeTypes = (mediaType: 'audio' | 'video') => {
    const collected: string[] = [];

    pickSupportedMediaRecorderMimeType({
      mediaType,
      isMimeTypeSupported: (mimeType) => {
        collected.push(mimeType);

        return false;
      },
    });

    return collected;
  };

  it('should only prefer recorder mime types the server upload allowlist accepts', () => {
    const preferredBaseMimeTypes = [
      ...collectPreferredMimeTypes('audio'),
      ...collectPreferredMimeTypes('video'),
    ].map((mimeType) => mimeType.split(';')[0]);

    for (const baseMimeType of preferredBaseMimeTypes) {
      expect(MEDIA_CAPTURE_MIME_TYPES).toContain(baseMimeType);
    }
  });

  it('should map every allowlisted recording container to a file extension', () => {
    const recordableMimeTypes = [
      'audio/webm',
      'video/webm',
      'audio/mp4',
      'video/mp4',
      'audio/ogg',
    ];

    for (const mimeType of recordableMimeTypes) {
      expect(MEDIA_CAPTURE_MIME_TYPES).toContain(mimeType);
      expect(getMediaCaptureFileExtension(mimeType)).not.toBe('');
    }
  });
});
