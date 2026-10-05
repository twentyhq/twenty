import { type FieldPermissionManifest } from 'twenty-shared/application';

import { fromFieldPermissionManifestToUniversalFlatFieldPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-field-permission-manifest-to-universal-flat-field-permission.util';
import { fromFlatFieldPermissionToFieldPermissionManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-permission-to-field-permission-manifest.util';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const ROLE_UID = '22222222-2222-4222-8222-222222222222';
const OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const FIELD_UID = '44444444-4444-4444-8444-444444444444';
const FIELD_PERMISSION_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-14T10:00:00.000Z';

const FIELD_PERMISSION_MANIFEST: Required<FieldPermissionManifest> = {
  universalIdentifier: FIELD_PERMISSION_UID,
  objectUniversalIdentifier: OBJECT_UID,
  fieldUniversalIdentifier: FIELD_UID,
  canReadFieldValue: true,
  canUpdateFieldValue: false,
};

const forward = (fieldPermissionManifest: FieldPermissionManifest) =>
  fromFieldPermissionManifestToUniversalFlatFieldPermission({
    fieldPermissionManifest,
    roleUniversalIdentifier: ROLE_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatFieldPermissionToFieldPermissionManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatFieldPermissionToFieldPermissionManifest({
        flatFieldPermission: forward(FIELD_PERMISSION_MANIFEST),
      }),
    ).toEqual(FIELD_PERMISSION_MANIFEST);
  });

  it('should reproduce a flat entity with an unset permission after an inverse then a forward conversion', () => {
    const flatFieldPermission: UniversalFlatFieldPermission = {
      ...forward(FIELD_PERMISSION_MANIFEST),
      canReadFieldValue: null,
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatFieldPermission,
        toUniversalFlatEntity: forward(
          fromFlatFieldPermissionToFieldPermissionManifest({
            flatFieldPermission,
          }),
        ),
        metadataName: 'fieldPermission',
      }),
    ).toBeUndefined();
  });

  it('should omit the permission a flat entity leaves unset', () => {
    const {
      canReadFieldValue: _canReadFieldValue,
      ...manifestWithUnsetPermission
    } = FIELD_PERMISSION_MANIFEST;

    expect(
      fromFlatFieldPermissionToFieldPermissionManifest({
        flatFieldPermission: forward(manifestWithUnsetPermission),
      }),
    ).toStrictEqual(manifestWithUnsetPermission);
  });
});
