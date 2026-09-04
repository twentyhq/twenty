import { type PermissionFlagManifest } from 'twenty-shared/application';

import { fromPermissionFlagManifestToUniversalFlatPermissionFlag } from 'src/engine/core-modules/application/application-manifest/converters/from-permission-flag-manifest-to-universal-flat-permission-flag.util';

const APP_UID = 'app-universal-identifier';
const NOW = '2026-09-03T00:00:00.000Z';

const buildPermissionFlagManifest = (
  overrides: Partial<PermissionFlagManifest> = {},
): PermissionFlagManifest => ({
  universalIdentifier: 'permission-flag-universal-identifier',
  key: 'EXPORT_RECORDS',
  label: 'Export records',
  ...overrides,
});

describe('fromPermissionFlagManifestToUniversalFlatPermissionFlag', () => {
  it('should convert a minimal permission flag manifest as a tool flag', () => {
    const result = fromPermissionFlagManifestToUniversalFlatPermissionFlag({
      permissionFlagManifest: buildPermissionFlagManifest(),
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    });

    expect(result).toEqual({
      universalIdentifier: 'permission-flag-universal-identifier',
      applicationUniversalIdentifier: APP_UID,
      key: 'EXPORT_RECORDS',
      label: 'Export records',
      description: null,
      icon: null,
      permissionType: 'tool',
      rolePermissionFlagUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('should respect an explicit permission type', () => {
    const result = fromPermissionFlagManifestToUniversalFlatPermissionFlag({
      permissionFlagManifest: buildPermissionFlagManifest({
        permissionType: 'settings',
      }),
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    });

    expect(result.permissionType).toBe('settings');
  });
});
