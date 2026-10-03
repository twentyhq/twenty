import { FieldMetadataType } from 'twenty-shared/types';

import { fromFieldPermissionManifestToUniversalFlatFieldPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-field-permission-manifest-to-universal-flat-field-permission.util';
import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { getInstalledDefaultRoleManifest } from 'src/engine/core-modules/application/application-manifest/utils/get-installed-default-role-manifest.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

const APP_ID = 'application-id';
const STANDARD_APP_ID = 'standard-application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-24T10:00:00.000Z';
const APP_UID = '10000000-0000-4000-8000-000000000001';
const PET_UID = '20000000-0000-4000-8000-000000000001';
const PERSON_UID = '20000000-0000-4000-8000-000000000002';
const PET_NAME_FIELD_UID = '30000000-0000-4000-8000-000000000001';
const DEFAULT_ROLE_UID = '40000000-0000-4000-8000-000000000001';
const SUPPORT_ROLE_UID = '40000000-0000-4000-8000-000000000002';
const PET_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000001';
const PERSON_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000002';
const SUPPORT_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000003';
const PET_NAME_FIELD_PERMISSION_UID = '70000000-0000-4000-8000-000000000001';

const withIds = <TUniversalFlatEntity extends { universalIdentifier: string }>(
  universalFlatEntity: TUniversalFlatEntity,
  applicationId = APP_ID,
) => ({
  ...universalFlatEntity,
  id: `${universalFlatEntity.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId,
});

const buildFlatRole = ({
  universalIdentifier,
  label,
}: {
  universalIdentifier: string;
  label: string;
}): FlatRole =>
  withIds(
    fromRoleManifestToUniversalFlatRole({
      roleManifest: { universalIdentifier, label, canAccessAllTools: true },
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
  ) as FlatRole;

const buildFlatObjectPermission = ({
  universalIdentifier,
  roleUniversalIdentifier = DEFAULT_ROLE_UID,
  objectUniversalIdentifier,
}: {
  universalIdentifier: string;
  roleUniversalIdentifier?: string;
  objectUniversalIdentifier: string;
}): FlatObjectPermission =>
  withIds(
    fromObjectPermissionManifestToUniversalFlatObjectPermission({
      objectPermissionManifest: {
        universalIdentifier,
        objectUniversalIdentifier,
        canReadObjectRecords: true,
      },
      roleUniversalIdentifier,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
  ) as FlatObjectPermission;

const buildFlatFieldPermission = ({
  universalIdentifier,
  objectUniversalIdentifier,
  fieldUniversalIdentifier,
}: {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
}): FlatFieldPermission =>
  withIds(
    fromFieldPermissionManifestToUniversalFlatFieldPermission({
      fieldPermissionManifest: {
        universalIdentifier,
        objectUniversalIdentifier,
        fieldUniversalIdentifier,
        canUpdateFieldValue: false,
      },
      roleUniversalIdentifier: DEFAULT_ROLE_UID,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
  ) as FlatFieldPermission;

const buildAllFlatEntityMaps = () => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        getFlatObjectMetadataMock({
          universalIdentifier: PET_UID,
          applicationId: APP_ID,
          applicationUniversalIdentifier: APP_UID,
          nameSingular: 'pet',
          namePlural: 'pets',
        }),
        getFlatObjectMetadataMock({
          universalIdentifier: PERSON_UID,
          applicationId: STANDARD_APP_ID,
          nameSingular: 'person',
          namePlural: 'people',
        }),
      ],
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
    flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        getFlatFieldMetadataMock({
          universalIdentifier: PET_NAME_FIELD_UID,
          type: FieldMetadataType.TEXT,
          objectMetadataId: `${PET_UID}-id`,
          objectMetadataUniversalIdentifier: PET_UID,
          applicationId: APP_ID,
          applicationUniversalIdentifier: APP_UID,
        }),
      ],
      flatEntityMaps: maps.flatFieldMetadataMaps,
    }),
    flatRoleMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        buildFlatRole({
          universalIdentifier: DEFAULT_ROLE_UID,
          label: 'App role',
        }),
        buildFlatRole({
          universalIdentifier: SUPPORT_ROLE_UID,
          label: 'Support',
        }),
      ],
      flatEntityMaps: maps.flatRoleMaps,
    }),
    flatObjectPermissionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        buildFlatObjectPermission({
          universalIdentifier: PET_OBJECT_PERMISSION_UID,
          objectUniversalIdentifier: PET_UID,
        }),
        buildFlatObjectPermission({
          universalIdentifier: PERSON_OBJECT_PERMISSION_UID,
          objectUniversalIdentifier: PERSON_UID,
        }),
        buildFlatObjectPermission({
          universalIdentifier: SUPPORT_OBJECT_PERMISSION_UID,
          roleUniversalIdentifier: SUPPORT_ROLE_UID,
          objectUniversalIdentifier: PET_UID,
        }),
      ],
      flatEntityMaps: maps.flatObjectPermissionMaps,
    }),
    flatFieldPermissionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        buildFlatFieldPermission({
          universalIdentifier: PET_NAME_FIELD_PERMISSION_UID,
          objectUniversalIdentifier: PET_UID,
          fieldUniversalIdentifier: PET_NAME_FIELD_UID,
        }),
      ],
      flatEntityMaps: maps.flatFieldPermissionMaps,
    }),
  };
};

const buildFlatApplicationMaps = (defaultRoleId: string | null) => ({
  byId: { [APP_ID]: { defaultRoleId } },
});

describe('getInstalledDefaultRoleManifest', () => {
  const allFlatEntityMaps = buildAllFlatEntityMaps();

  it('rebuilds the default role with its permissions on application objects, core objects and application fields', () => {
    expect(
      getInstalledDefaultRoleManifest({
        applicationId: APP_ID,
        flatApplicationMaps: buildFlatApplicationMaps(`${DEFAULT_ROLE_UID}-id`),
        allFlatEntityMaps,
      }),
    ).toMatchObject({
      universalIdentifier: DEFAULT_ROLE_UID,
      label: 'App role',
      canAccessAllTools: true,
      objectPermissions: [
        { objectUniversalIdentifier: PET_UID, canReadObjectRecords: true },
        { objectUniversalIdentifier: PERSON_UID, canReadObjectRecords: true },
      ],
      fieldPermissions: [
        {
          objectUniversalIdentifier: PET_UID,
          fieldUniversalIdentifier: PET_NAME_FIELD_UID,
          canUpdateFieldValue: false,
        },
      ],
    });
  });

  it('returns nothing when the application has no default role', () => {
    expect(
      getInstalledDefaultRoleManifest({
        applicationId: APP_ID,
        flatApplicationMaps: buildFlatApplicationMaps(null),
        allFlatEntityMaps,
      }),
    ).toBeUndefined();
  });

  it('returns nothing when the default role is not in the workspace roles', () => {
    expect(
      getInstalledDefaultRoleManifest({
        applicationId: APP_ID,
        flatApplicationMaps: buildFlatApplicationMaps('unknown-role-id'),
        allFlatEntityMaps,
      }),
    ).toBeUndefined();
  });
});
