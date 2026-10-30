import { toIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-iframe-media-permissions.util';

const PHONE_ORIGIN = 'https://phone.example.com';

describe('toIframeMediaPermissions', () => {
  it('should keep valid permissions in the declared order', () => {
    expect(
      toIframeMediaPermissions([
        { origin: 'https://video.example.com', microphone: true, camera: true },
        { origin: PHONE_ORIGIN, microphone: true, camera: false },
      ]),
    ).toEqual([
      { origin: 'https://video.example.com', microphone: true, camera: true },
      { origin: PHONE_ORIGIN, microphone: true, camera: false },
    ]);
  });

  it('should normalize origins and merge duplicates', () => {
    expect(
      toIframeMediaPermissions([
        {
          origin: 'https://Phone.Example.com/',
          microphone: true,
          camera: false,
        },
        { origin: PHONE_ORIGIN, microphone: false, camera: true },
      ]),
    ).toEqual([{ origin: PHONE_ORIGIN, microphone: true, camera: true }]);
  });

  it('should drop origins that are not exact HTTPS origins', () => {
    expect(
      toIframeMediaPermissions([
        { origin: 'http://phone.example.com', microphone: true, camera: false },
        { origin: `${PHONE_ORIGIN}/calls`, microphone: true, camera: false },
        { origin: 'https://*.example.com', microphone: true, camera: false },
      ]),
    ).toEqual([]);
  });

  it('should drop permissions that allow no media', () => {
    expect(
      toIframeMediaPermissions([
        { origin: PHONE_ORIGIN, microphone: false, camera: false },
        { origin: PHONE_ORIGIN, microphone: 'yes', camera: 1 },
      ]),
    ).toEqual([]);
  });

  it('should treat a manifest value that is not an array as no permission', () => {
    expect(toIframeMediaPermissions(undefined)).toEqual([]);
    expect(toIframeMediaPermissions({ origin: PHONE_ORIGIN })).toEqual([]);
    expect(toIframeMediaPermissions(null)).toEqual([]);
  });

  it('should ignore elements that are not permissions', () => {
    expect(
      toIframeMediaPermissions([
        null,
        PHONE_ORIGIN,
        { microphone: true },
        { origin: PHONE_ORIGIN, microphone: true, camera: false },
      ]),
    ).toEqual([{ origin: PHONE_ORIGIN, microphone: true, camera: false }]);
  });
});
