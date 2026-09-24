import { type Manifest, type RoleManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { ApplicationUpgradeRoleGrantService } from 'src/engine/core-modules/application/application-manifest/services/application-upgrade-role-grant.service';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const APP_ID = 'application-id';
const STANDARD_APP_ID = 'standard-application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-24T10:00:00.000Z';
const APP_UID = '10000000-0000-4000-8000-000000000001';
const PET_UID = '20000000-0000-4000-8000-000000000001';
const PERSON_UID = '20000000-0000-4000-8000-000000000002';
const PET_NAME_FIELD_UID = '30000000-0000-4000-8000-000000000001';
const DEFAULT_ROLE_UID = '40000000-0000-4000-8000-000000000001';
const PET_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000001';
const PERSON_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000002';

const withIds = <TUniversalFlatEntity extends { universalIdentifier: string }>(
  universalFlatEntity: TUniversalFlatEntity,
  applicationId = APP_ID,
) => ({
  ...universalFlatEntity,
  id: `${universalFlatEntity.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId,
});

const installedDefaultRole = withIds(
  fromRoleManifestToUniversalFlatRole({
    roleManifest: {
      universalIdentifier: DEFAULT_ROLE_UID,
      label: 'App role',
      canAccessAllTools: true,
    },
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
) as FlatRole;

const buildFlatObjectPermission = ({
  universalIdentifier,
  objectUniversalIdentifier,
}: {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
}): FlatObjectPermission =>
  withIds(
    fromObjectPermissionManifestToUniversalFlatObjectPermission({
      objectPermissionManifest: {
        universalIdentifier,
        objectUniversalIdentifier,
        canReadObjectRecords: true,
      },
      roleUniversalIdentifier: DEFAULT_ROLE_UID,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
  ) as FlatObjectPermission;

const buildWorkspaceCache = ({
  defaultRoleId,
}: {
  defaultRoleId: string | null;
}) => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatApplicationMaps: {
      byId: { [APP_ID]: { id: APP_ID, defaultRoleId } },
      byUniversalIdentifier: {},
    },
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
      flatEntities: [installedDefaultRole],
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
      ],
      flatEntityMaps: maps.flatObjectPermissionMaps,
    }),
  };
};

const buildManifest = (defaultRole: RoleManifest) =>
  ({
    application: {
      universalIdentifier: APP_UID,
      displayName: 'Pets',
      description: '',
      defaultRoleUniversalIdentifier: DEFAULT_ROLE_UID,
      packageJsonChecksum: '',
      yarnLockChecksum: '',
    },
    roles: [defaultRole],
    permissionFlags: [],
  }) satisfies Pick<Manifest, 'application' | 'roles' | 'permissionFlags'>;

const sameGrantsAsInstalled: RoleManifest = {
  universalIdentifier: DEFAULT_ROLE_UID,
  label: 'App role',
  canAccessAllTools: true,
  objectPermissions: [
    { objectUniversalIdentifier: PET_UID, canReadObjectRecords: true },
    { objectUniversalIdentifier: PERSON_UID, canReadObjectRecords: true },
  ],
};

describe('ApplicationUpgradeRoleGrantService', () => {
  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const service = new ApplicationUpgradeRoleGrantService(
    workspaceCacheService as unknown as WorkspaceCacheService,
  );

  beforeEach(() => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      buildWorkspaceCache({ defaultRoleId: `${DEFAULT_ROLE_UID}-id` }),
    );
  });

  it('returns nothing when the manifest default role matches the installed one', async () => {
    await expect(
      service.getDefaultRoleGrantsAddedByManifest({
        workspaceId: WORKSPACE_ID,
        applicationId: APP_ID,
        manifest: buildManifest(sameGrantsAsInstalled),
      }),
    ).resolves.toEqual([]);
  });

  it('reports grants on application objects, core objects and role-level flags the installed role lacks', async () => {
    await expect(
      service.getDefaultRoleGrantsAddedByManifest({
        workspaceId: WORKSPACE_ID,
        applicationId: APP_ID,
        manifest: buildManifest({
          ...sameGrantsAsInstalled,
          canUpdateAllSettings: true,
          objectPermissions: [
            {
              objectUniversalIdentifier: PET_UID,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
            },
            {
              objectUniversalIdentifier: PERSON_UID,
              canReadObjectRecords: true,
              canSoftDeleteObjectRecords: true,
            },
          ],
        }),
      }),
    ).resolves.toEqual([
      { type: 'ALL_SETTINGS' },
      {
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier: PET_UID,
        action: 'canUpdateObjectRecords',
      },
      {
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier: PERSON_UID,
        action: 'canSoftDeleteObjectRecords',
      },
    ]);
  });

  it('returns nothing when the application has no default role installed', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue(
      buildWorkspaceCache({ defaultRoleId: null }),
    );

    await expect(
      service.getDefaultRoleGrantsAddedByManifest({
        workspaceId: WORKSPACE_ID,
        applicationId: APP_ID,
        manifest: buildManifest({
          ...sameGrantsAsInstalled,
          canUpdateAllSettings: true,
        }),
      }),
    ).resolves.toEqual([]);
  });
});
