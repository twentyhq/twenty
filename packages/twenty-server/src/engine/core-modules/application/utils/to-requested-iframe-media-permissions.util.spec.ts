import { i18n } from '@lingui/core';
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

  it('reports the translated origin limit before granting permissions', () => {
    expect.assertions(1);

    try {
      toRequestedIframeMediaPermissions(PERMISSIONS);
    } catch (error) {
      if (!(error instanceof ApplicationException)) {
        throw error;
      }

      expect(i18n._(error.userFriendlyMessage)).toBe(
        `An application can request iframe media access for up to ${MAX_ALLOWED_IFRAME_ORIGINS} origins`,
      );
    }
  });
});
