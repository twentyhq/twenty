import { pickSupportedMediaRecorderMimeType } from '@/front-components/media-capture/utils/pickSupportedMediaRecorderMimeType';

describe('pickSupportedMediaRecorderMimeType', () => {
  it('should return the most preferred supported audio mime type', () => {
    const mimeType = pickSupportedMediaRecorderMimeType('audio', () => true);

    expect(mimeType).toBe('audio/webm;codecs=opus');
  });

  it('should skip unsupported mime types until a supported one is found', () => {
    const mimeType = pickSupportedMediaRecorderMimeType(
      'audio',
      (candidate) => candidate === 'audio/mp4',
    );

    expect(mimeType).toBe('audio/mp4');
  });

  it('should return a video mime type when capturing video', () => {
    const mimeType = pickSupportedMediaRecorderMimeType(
      'video',
      (candidate) => candidate === 'video/webm',
    );

    expect(mimeType).toBe('video/webm');
  });

  it('should return undefined when no mime type is supported', () => {
    const mimeType = pickSupportedMediaRecorderMimeType('video', () => false);

    expect(mimeType).toBeUndefined();
  });
});
