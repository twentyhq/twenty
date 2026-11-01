import { MAX_ALLOWED_IFRAME_ORIGINS } from 'twenty-shared/constants';

import { isIframeMediaPermissionsPolicyWithinSizeLimit } from 'src/engine/core-modules/frontend/utils/is-iframe-media-permissions-policy-within-size-limit.util';

const buildPermissions = (host: (index: number) => string) =>
  Array.from({ length: MAX_ALLOWED_IFRAME_ORIGINS }, (_, index) => ({
    origin: `https://${host(index)}.example.com`,
    microphone: true,
    camera: true,
  }));

describe('isIframeMediaPermissionsPolicyWithinSizeLimit', () => {
  it('accepts the maximum number of typical origins', () => {
    expect(
      isIframeMediaPermissionsPolicyWithinSizeLimit(
        buildPermissions((index) => `phone-${index}`),
      ),
    ).toBe(true);
  });

  it('rejects long origins that would overflow the response header buffer', () => {
    expect(
      isIframeMediaPermissionsPolicyWithinSizeLimit(
        buildPermissions(
          (index) =>
            `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.phone-${index}`,
        ),
      ),
    ).toBe(false);
  });
});
