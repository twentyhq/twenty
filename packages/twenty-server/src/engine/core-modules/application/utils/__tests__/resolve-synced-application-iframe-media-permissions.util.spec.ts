import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveSyncedApplicationIframeMediaPermissions } from 'src/engine/core-modules/application/utils/resolve-synced-application-iframe-media-permissions.util';

const PHONE_PERMISSION = {
  origin: 'https://phone.example.com',
  microphone: true,
  camera: false,
};
const VIDEO_PERMISSION = {
  origin: 'https://video.example.com',
  microphone: true,
  camera: true,
};

describe('resolveSyncedApplicationIframeMediaPermissions', () => {
  it('should not widen a grant on a published application update', () => {
    expect(
      resolveSyncedApplicationIframeMediaPermissions({
        sourceType: ApplicationRegistrationSourceType.NPM,
        grantedIframeMediaPermissions: [PHONE_PERMISSION],
        requestedIframeMediaPermissions: [PHONE_PERMISSION, VIDEO_PERMISSION],
      }),
    ).toEqual([PHONE_PERMISSION]);
  });

  it('should grant the requested permissions to a local application', () => {
    expect(
      resolveSyncedApplicationIframeMediaPermissions({
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        grantedIframeMediaPermissions: [PHONE_PERMISSION],
        requestedIframeMediaPermissions: [VIDEO_PERMISSION],
      }),
    ).toEqual([PHONE_PERMISSION, VIDEO_PERMISSION]);
  });

  it('should treat a missing grant as no permission', () => {
    expect(
      resolveSyncedApplicationIframeMediaPermissions({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        grantedIframeMediaPermissions: undefined,
        requestedIframeMediaPermissions: [VIDEO_PERMISSION],
      }),
    ).toEqual([]);
  });
});
