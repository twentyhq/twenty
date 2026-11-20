import { describe, expect, it } from 'vitest';
import { getFileExtension } from 'src/logic-functions/data/get-file-extension.util';

describe('getFileExtension', () => {
  it('should ignore MIME type parameters such as voice note codecs', () => {
    expect(getFileExtension('audio/ogg; codecs=opus')).toBe('.ogg');
  });

  it('should return an empty string for an unknown MIME type', () => {
    expect(getFileExtension('application/unknown')).toBe('');
  });
});
