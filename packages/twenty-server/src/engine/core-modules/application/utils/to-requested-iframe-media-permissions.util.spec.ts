import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';

import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { toRequestedIframeMediaPermissions } from 'src/engine/core-modules/application/utils/to-requested-iframe-media-permissions.util';

const PERMISSIONS = Array.from(
  { length: MAX_ALLOWED_IFRAME_ORIGINS + 1 },
  (_, index) => ({
    origin: `https://phone-${index}.example.com`,
    microphone: true,
    camera: false,
  }),
);

describe('toRequestedIframeMediaPermissions', () => {
  it('accepts a manifest at the origin limit', () => {
    const permissions = PERMISSIONS.slice(0, MAX_ALLOWED_IFRAME_ORIGINS);

    expect(toRequestedIframeMediaPermissions(permissions)).toEqual(permissions);
  });

  it('rejects a manifest above the origin limit before granting permissions', () => {
    expect(() => toRequestedIframeMediaPermissions(PERMISSIONS)).toThrow(
      ApplicationException,
    );
  });
});
