import { type ObjectRecordsPermissionsManifest } from 'twenty-shared/application';

import { fromFlatObjectPermissionToObjectRecordsPermissionsManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-permission-to-object-records-permissions-manifest.util';
import { fromObjectRecordsPermissionsManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-records-permissions-manifest-to-universal-flat-object-permission.util';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const ROLE_UID = '22222222-2222-4222-8222-222222222222';
const OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const OBJECT_PERMISSION_UID = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-09-14T10:00:00.000Z';

type AllRecordsManifest = Omit<
  ObjectRecordsPermissionsManifest,
  'rowLevelRecordsPermissions'
>;

const ALL_RECORDS_MANIFEST: Required<AllRecordsManifest> = {
  universalIdentifier: OBJECT_PERMISSION_UID,
  objectUniversalIdentifier: OBJECT_UID,
  canReadAllRecords: true,
  canCreateAllRecords: true,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: true,
};

const forward = (objectRecordsPermissionsManifest: AllRecordsManifest) =>
  fromObjectRecordsPermissionsManifestToUniversalFlatObjectPermission({
    objectRecordsPermissionsManifest,
    roleUniversalIdentifier: ROLE_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatObjectPermissionToObjectRecordsPermissionsManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatObjectPermissionToObjectRecordsPermissionsManifest({
        flatObjectPermission: forward(ALL_RECORDS_MANIFEST),
      }),
    ).toEqual(ALL_RECORDS_MANIFEST);
  });

  it('should reproduce a flat entity with unset permissions after an inverse then a forward conversion', () => {
    const flatObjectPermission: UniversalFlatObjectPermission = {
      ...forward(ALL_RECORDS_MANIFEST),
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatObjectPermission,
        toUniversalFlatEntity: forward(
          fromFlatObjectPermissionToObjectRecordsPermissionsManifest({
            flatObjectPermission,
          }),
        ),
        metadataName: 'objectPermission',
      }),
    ).toBeUndefined();
  });

  it('should omit the permissions a flat entity leaves unset', () => {
    const {
      canSoftDeleteAllRecords: _canSoftDeleteAllRecords,
      canDestroyAllRecords: _canDestroyAllRecords,
      ...manifestWithUnsetPermissions
    } = ALL_RECORDS_MANIFEST;

    expect(
      fromFlatObjectPermissionToObjectRecordsPermissionsManifest({
        flatObjectPermission: forward(manifestWithUnsetPermissions),
      }),
    ).toStrictEqual(manifestWithUnsetPermissions);
  });

  it('should make create follow update when the manifest leaves create unset', () => {
    const { canCreateAllRecords: _canCreateAllRecords, ...manifest } =
      ALL_RECORDS_MANIFEST;

    expect(forward(manifest).canCreateObjectRecords).toBe(false);
  });
});
