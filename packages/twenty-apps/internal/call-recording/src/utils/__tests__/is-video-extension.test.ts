import { describe, expect, it } from 'vitest';

import { isVideoExtension } from 'src/utils/is-video-extension';

describe('isVideoExtension', () => {
  it('should return true for a known video extension', () => {
    expect(isVideoExtension('mp4')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isVideoExtension('MOV')).toBe(true);
  });

  it('should return false for a non-video extension', () => {
    expect(isVideoExtension('mp3')).toBe(false);
  });
});
