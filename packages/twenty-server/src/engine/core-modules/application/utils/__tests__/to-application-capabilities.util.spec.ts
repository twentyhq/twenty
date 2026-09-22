import { toApplicationCapabilities } from 'src/engine/core-modules/application/utils/to-application-capabilities.util';

describe('toApplicationCapabilities', () => {
  it('should keep the supported capabilities in the declared order', () => {
    expect(toApplicationCapabilities(['camera', 'microphone'])).toEqual([
      'camera',
      'microphone',
    ]);
  });

  it('should drop capabilities outside the supported set', () => {
    expect(toApplicationCapabilities(['microphone', 'screen'])).toEqual([
      'microphone',
    ]);
  });

  it('should treat an absent declaration as no capability', () => {
    expect(toApplicationCapabilities(undefined)).toEqual([]);
  });

  it('should treat a manifest value that is not an array as no capability', () => {
    expect(toApplicationCapabilities('microphone')).toEqual([]);
    expect(toApplicationCapabilities({ microphone: true })).toEqual([]);
    expect(toApplicationCapabilities(null)).toEqual([]);
  });

  it('should ignore elements that are not strings', () => {
    expect(
      toApplicationCapabilities(['microphone', null, 42, { camera: true }]),
    ).toEqual(['microphone']);
  });
});
