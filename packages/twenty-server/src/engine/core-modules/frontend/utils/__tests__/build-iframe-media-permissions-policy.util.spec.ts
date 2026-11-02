import { buildIframeMediaPermissionsPolicy } from '../build-iframe-media-permissions-policy.util';

describe('buildIframeMediaPermissionsPolicy', () => {
  it('preserves native capture without delegating to external origins by default', () => {
    expect(buildIframeMediaPermissionsPolicy([])).toBe(
      'microphone=(self), camera=(self)',
    );
  });

  it('delegates microphone and camera independently', () => {
    expect(
      buildIframeMediaPermissionsPolicy([
        {
          origin: 'https://phone.example.com',
          microphone: true,
          camera: false,
        },
        {
          origin: 'https://video.example.com',
          microphone: false,
          camera: true,
        },
      ]),
    ).toBe(
      'microphone=(self "https://phone.example.com"), camera=(self "https://video.example.com")',
    );
  });

  it('normalizes and deduplicates persisted origins before serializing the header', () => {
    expect(
      buildIframeMediaPermissionsPolicy([
        {
          origin: 'https://PHONE.example.com:443/',
          microphone: true,
          camera: false,
        },
        {
          origin: 'https://phone.example.com',
          microphone: true,
          camera: true,
        },
      ]),
    ).toBe(
      'microphone=(self "https://phone.example.com"), camera=(self "https://phone.example.com")',
    );
  });

  it.each([
    'http://phone.example.com',
    'https://*.example.com',
    'https://phone.example.com/calls',
    'https://phone.example.com"), camera=(*)',
  ])('does not delegate to an invalid persisted origin: %s', (origin) => {
    expect(
      buildIframeMediaPermissionsPolicy([
        { origin, microphone: true, camera: true },
      ]),
    ).toBe('microphone=(self), camera=(self)');
  });
});
