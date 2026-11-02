import { getIframeMediaAllow } from '@/media-access/utils/getIframeMediaAllow';

describe('getIframeMediaAllow', () => {
  it.each([undefined, ''])(
    'denies media by default for the allow value %p',
    (allow) => {
      expect(getIframeMediaAllow({ allow })).toBe(
        "microphone 'none'; camera 'none'",
      );
    },
  );

  it('removes every media directive while preserving unrelated permissions', () => {
    expect(
      getIframeMediaAllow({
        allow: " MICROPHONE *; Camera; microphone 'src'; fullscreen; autoplay ",
        permission: null,
      }),
    ).toBe("microphone 'none'; camera 'none'; fullscreen; autoplay");
  });

  it.each([
    'camera:*',
    'camera*',
    'cameras *',
    'Microphone:*',
    'microphones *',
  ])(
    'removes the prefixed media directive %s that WebKit also parses as a media feature',
    (mediaDirective) => {
      expect(
        getIframeMediaAllow({
          allow: `${mediaDirective}; autoplay`,
          permission: null,
        }),
      ).toBe("microphone 'none'; camera 'none'; autoplay");
    },
  );

  it('places the enforced media directives before every guest directive so the first declaration wins', () => {
    expect(
      getIframeMediaAllow({
        allow: 'autoplay; fullscreen',
        permission: {
          origin: 'https://phone.example.com',
          microphone: true,
          camera: false,
        },
      }).split('; '),
    ).toEqual([
      'microphone https://phone.example.com',
      "camera 'none'",
      'autoplay',
      'fullscreen',
    ]);
  });

  it.each([
    {
      microphone: true,
      camera: false,
      expected: "microphone https://phone.example.com; camera 'none'",
    },
    {
      microphone: false,
      camera: true,
      expected: "microphone 'none'; camera https://phone.example.com",
    },
    {
      microphone: true,
      camera: true,
      expected:
        'microphone https://phone.example.com; camera https://phone.example.com',
    },
  ])(
    'serializes exact origins independently for microphone=$microphone and camera=$camera',
    ({ microphone, camera, expected }) => {
      expect(
        getIframeMediaAllow({
          allow: 'camera *; microphone https://other.example.com',
          permission: {
            origin: 'https://PHONE.example.com:443/',
            microphone,
            camera,
          },
        }),
      ).toBe(expected);
    },
  );

  it.each(['http://phone.example.com', 'https://phone.example.com; camera *'])(
    'denies both capabilities when the supplied origin is invalid: %s',
    (origin) => {
      expect(
        getIframeMediaAllow({
          allow: 'microphone *; camera *',
          permission: { origin, microphone: true, camera: true },
        }),
      ).toBe("microphone 'none'; camera 'none'");
    },
  );
});
