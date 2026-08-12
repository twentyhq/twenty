import { getMediaCaptureFileExtension } from '@/front-components/media-capture/utils/getMediaCaptureFileExtension';

describe('getMediaCaptureFileExtension', () => {
  it('should strip codec parameters before mapping', () => {
    expect(getMediaCaptureFileExtension('audio/webm;codecs=opus')).toBe('webm');
  });

  it('should map audio mp4 to m4a', () => {
    expect(getMediaCaptureFileExtension('audio/mp4')).toBe('m4a');
  });

  it('should map video mp4 to mp4', () => {
    expect(getMediaCaptureFileExtension('video/mp4')).toBe('mp4');
  });

  it('should fall back to webm for unknown mime types', () => {
    expect(getMediaCaptureFileExtension('')).toBe('webm');
    expect(getMediaCaptureFileExtension('application/octet-stream')).toBe(
      'webm',
    );
  });
});
