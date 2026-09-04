import { fromFlatApplicationToApplicationManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-application-to-application-manifest.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

const ROLE_UID = 'role-universal-identifier';

const buildFlatApplication = (
  overrides: Partial<FlatApplication>,
): FlatApplication =>
  ({
    universalIdentifier: 'application-universal-identifier',
    name: 'Ticketing',
    description: 'Tickets for support',
    logo: null,
    billing: {},
    packageJsonChecksum: 'package-json-checksum',
    yarnLockChecksum: 'yarn-lock-checksum',
    ...overrides,
  }) as FlatApplication;

describe('fromFlatApplicationToApplicationManifest', () => {
  it('should map the application header', () => {
    expect(
      fromFlatApplicationToApplicationManifest({
        flatApplication: buildFlatApplication({}),
        defaultRoleUniversalIdentifier: ROLE_UID,
      }),
    ).toEqual({
      universalIdentifier: 'application-universal-identifier',
      displayName: 'Ticketing',
      description: 'Tickets for support',
      defaultRoleUniversalIdentifier: ROLE_UID,
      packageJsonChecksum: 'package-json-checksum',
      yarnLockChecksum: 'yarn-lock-checksum',
    });
  });

  it('should emit the logo and a non-empty billing declaration', () => {
    const billing = { recurringCharges: [] };

    expect(
      fromFlatApplicationToApplicationManifest({
        flatApplication: buildFlatApplication({
          logo: 'https://example.com/logo.png',
          billing: billing as FlatApplication['billing'],
        }),
        defaultRoleUniversalIdentifier: ROLE_UID,
      }),
    ).toMatchObject({ logo: 'https://example.com/logo.png', billing });
  });

  it('should default a missing description to an empty string', () => {
    expect(
      fromFlatApplicationToApplicationManifest({
        flatApplication: buildFlatApplication({ description: null }),
        defaultRoleUniversalIdentifier: ROLE_UID,
      }).description,
    ).toBe('');
  });
});
