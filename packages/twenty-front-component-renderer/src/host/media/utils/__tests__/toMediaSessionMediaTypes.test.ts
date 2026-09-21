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

  it('should reduce a detailed constraint object to its kind', () => {
    expect(
      toMediaSessionMediaTypes({
        audio: false,
        video: { deviceId: { exact: 'a-specific-camera' } },
      }),
    ).toEqual(['video']);
  });

  it('should ignore values the worker sends that are not booleans', () => {
    expect(toMediaSessionMediaTypes({ audio: undefined, video: null })).toEqual(
      [],
    );
  });
});
