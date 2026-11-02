import { type ManagedIframeProps } from '@/media-access/types/ManagedIframeProps';
import { getManagedIframeMediaPermission } from '@/media-access/utils/getManagedIframeMediaPermission';

const TRUSTED_ORIGIN = 'https://phone.example.com';
const DEFAULT_INPUT = {
  src: `${TRUSTED_ORIGIN}/dialer`,
  requestedMediaCapabilities: ['microphone', 'camera'],
  iframeMediaPermissions: [
    { origin: TRUSTED_ORIGIN, microphone: true, camera: false },
  ],
  hostOrigin: 'https://workspace.twenty.com',
} satisfies Pick<
  ManagedIframeProps,
  'src' | 'requestedMediaCapabilities' | 'iframeMediaPermissions'
> & { hostOrigin: string };

describe('getManagedIframeMediaPermission', () => {
  it('intersects requested capabilities and the exact workspace origin grant', () => {
    expect(getManagedIframeMediaPermission(DEFAULT_INPUT)).toEqual({
      origin: TRUSTED_ORIGIN,
      microphone: true,
      camera: false,
    });
  });

  it('returns no permission when no requested capability is approved for the origin', () => {
    expect(
      getManagedIframeMediaPermission({
        ...DEFAULT_INPUT,
        requestedMediaCapabilities: ['camera'],
      }),
    ).toBeNull();
  });

  it.each([
    'http://phone.example.com',
    'https://untrusted.example.com',
    'https://phone.example.com.attacker.example',
    'https://subdomain.phone.example.com',
    'https://phone.example.com:444',
    'https://user:password@phone.example.com',
    'https://workspace.twenty.com',
    'blob:https://phone.example.com/stream',
    'data:text/html,hello',
    'about:blank',
    '/dialer',
  ])('does not delegate media to %s', (src) => {
    expect(
      getManagedIframeMediaPermission({ ...DEFAULT_INPUT, src }),
    ).toBeNull();
  });

  it('rejects srcDoc even when src is an approved HTTPS URL', () => {
    expect(
      getManagedIframeMediaPermission({ ...DEFAULT_INPUT, srcDoc: '' }),
    ).toBeNull();
  });

  it('rejects the host origin even when it has a workspace grant', () => {
    expect(
      getManagedIframeMediaPermission({
        ...DEFAULT_INPUT,
        hostOrigin: TRUSTED_ORIGIN,
      }),
    ).toBeNull();
  });

  it('does not delegate capabilities that the embed did not request', () => {
    expect(
      getManagedIframeMediaPermission({
        ...DEFAULT_INPUT,
        requestedMediaCapabilities: undefined,
      }),
    ).toBeNull();
  });
});
