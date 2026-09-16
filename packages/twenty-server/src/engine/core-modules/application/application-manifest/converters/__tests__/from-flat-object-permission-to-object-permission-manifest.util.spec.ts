import { type ObjectPermissionManifest } from 'twenty-shared/application';

import { fromFlatObjectPermissionToObjectPermissionManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-permission-to-object-permission-manifest.util';
import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const ROLE_UID = '22222222-2222-4222-8222-222222222222';
const OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const OBJECT_PERMISSION_UID = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-09-14T10:00:00.000Z';

const OBJECT_PERMISSION_MANIFEST: Required<ObjectPermissionManifest> = {
  universalIdentifier: OBJECT_PERMISSION_UID,
  objectUniversalIdentifier: OBJECT_UID,
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: true,
};

const forward = (objectPermissionManifest: ObjectPermissionManifest) =>
  fromObjectPermissionManifestToUniversalFlatObjectPermission({
    objectPermissionManifest,
    roleUniversalIdentifier: ROLE_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatObjectPermissionToObjectPermissionManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatObjectPermissionToObjectPermissionManifest({
        flatObjectPermission: forward(OBJECT_PERMISSION_MANIFEST),
      }),
    ).toEqual(OBJECT_PERMISSION_MANIFEST);
  });

  it('should reproduce a flat entity with unset permissions after an inverse then a forward conversion', () => {
    const flatObjectPermission: UniversalFlatObjectPermission = {
      ...forward(OBJECT_PERMISSION_MANIFEST),
      canSoftDeleteObjectRecords: null,
      canDestroyObjectRecords: null,
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatObjectPermission,
        toUniversalFlatEntity: forward(
          fromFlatObjectPermissionToObjectPermissionManifest({
            flatObjectPermission,
          }),
        ),
        metadataName: 'objectPermission',
      }),
    ).toBeUndefined();
  });

  it('should omit the permissions a flat entity leaves unset', () => {
    const {
      canSoftDeleteObjectRecords: _canSoftDeleteObjectRecords,
      canDestroyObjectRecords: _canDestroyObjectRecords,
      ...manifestWithUnsetPermissions
    } = OBJECT_PERMISSION_MANIFEST;

    expect(
      fromFlatObjectPermissionToObjectPermissionManifest({
        flatObjectPermission: forward(manifestWithUnsetPermissions),
      }),
    ).toStrictEqual(manifestWithUnsetPermissions);
  });
});
