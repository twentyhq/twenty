import { toMediaSessionMediaTypes } from '../toMediaSessionMediaTypes';

describe('toMediaSessionMediaTypes', () => {
  it('should derive the requested kinds from booleans', () => {
    expect(toMediaSessionMediaTypes({ audio: true, video: false })).toEqual([
      'audio',
    ]);
    expect(toMediaSessionMediaTypes({ audio: true, video: true })).toEqual([
      'audio',
      'video',
    ]);
  });

  it('should return no kind when nothing is requested', () => {
    expect(toMediaSessionMediaTypes({ audio: false, video: false })).toEqual(
      [],
    );
  });

  it('should derive video without requesting audio', () => {
    expect(toMediaSessionMediaTypes({ audio: false, video: true })).toEqual([
      'video',
    ]);
  });
});
