import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveSyncedApplicationCapabilities } from 'src/engine/core-modules/application/utils/resolve-synced-application-capabilities.util';

describe('resolveSyncedApplicationCapabilities', () => {
  it('should not widen a grant on a published application update', () => {
    expect(
      resolveSyncedApplicationCapabilities({
        sourceType: ApplicationRegistrationSourceType.NPM,
        grantedCapabilities: ['microphone'],
        requestedCapabilities: ['microphone', 'camera'],
      }),
    ).toEqual(['microphone']);
  });

  it('should preserve workspace approval when the manifest no longer declares it', () => {
    expect(
      resolveSyncedApplicationCapabilities({
        sourceType: ApplicationRegistrationSourceType.TARBALL,
        grantedCapabilities: ['microphone', 'camera'],
        requestedCapabilities: ['camera'],
      }),
    ).toEqual(['microphone', 'camera']);
  });

  it('should preserve runtime approval for legacy manifests', () => {
    expect(
      resolveSyncedApplicationCapabilities({
        sourceType: ApplicationRegistrationSourceType.NPM,
        grantedCapabilities: ['microphone'],
        requestedCapabilities: undefined,
      }),
    ).toEqual(['microphone']);
  });

  it('should let a workspace-owned development application sync its manifest', () => {
    expect(
      resolveSyncedApplicationCapabilities({
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        grantedCapabilities: ['microphone'],
        requestedCapabilities: ['camera'],
      }),
    ).toEqual(['microphone', 'camera']);
  });

  it('should treat a column hidden by a pending upgrade as an empty grant', () => {
    expect(
      resolveSyncedApplicationCapabilities({
        sourceType: ApplicationRegistrationSourceType.NPM,
        grantedCapabilities: undefined,
        requestedCapabilities: ['microphone'],
      }),
    ).toEqual([]);
  });

  it('should ignore capabilities outside the supported set', () => {
    expect(
      resolveSyncedApplicationCapabilities({
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        grantedCapabilities: [],
        requestedCapabilities: ['microphone', 'screen', 'Camera'],
      }),
    ).toEqual(['microphone']);
  });
});
