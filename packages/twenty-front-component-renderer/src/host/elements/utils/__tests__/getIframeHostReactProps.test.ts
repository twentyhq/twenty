import { getIframeHostReactProps } from '@/host/elements/utils/getIframeHostReactProps';

describe('getIframeHostReactProps', () => {
  it('keeps the iframe source, visibility and media options', () => {
    expect(
      getIframeHostReactProps({
        src: 'https://phone.example.com',
        srcDoc: '<p>Sandboxed content</p>',
        hidden: true,
        sandbox: 'allow-scripts',
        allow: 'microphone',
      }),
    ).toEqual({
      src: 'https://phone.example.com',
      srcDoc: '<p>Sandboxed content</p>',
      hidden: true,
      sandbox: 'allow-scripts',
      allow: 'microphone',
    });
  });

  it('drops malformed wire values and properties outside the iframe contract', () => {
    const props = getIframeHostReactProps({
      src: {},
      srcDoc: 42,
      allow: true,
      sandbox: ['allow-same-origin'],
      hidden: 'true',
      style: { width: 400 },
      iframeMediaPermissions: [{ origin: 'https://phone.example.com' }],
    });

    expect(props).toEqual({
      src: undefined,
      srcDoc: undefined,
      allow: undefined,
      sandbox: undefined,
      hidden: undefined,
    });
  });
});
