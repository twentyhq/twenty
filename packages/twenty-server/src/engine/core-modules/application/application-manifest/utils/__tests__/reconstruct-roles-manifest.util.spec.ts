import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fromFieldPermissionManifestToUniversalFlatFieldPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-field-permission-manifest-to-universal-flat-field-permission.util';
import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromPermissionFlagManifestToUniversalFlatPermissionFlag } from 'src/engine/core-modules/application/application-manifest/converters/from-permission-flag-manifest-to-universal-flat-permission-flag.util';
import { fromPermissionFlagToUniversalFlatRolePermissionFlag } from 'src/engine/core-modules/application/application-manifest/converters/from-permission-flag-to-universal-flat-role-permission-flag.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-group-manifest-to-universal-flat-row-level-permission-predicate-group.util';
import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { reconstructRolesManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-roles-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

const APP_ID = 'application-id';
const STANDARD_APP_ID = 'standard-application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-14T10:00:00.000Z';
const APP_UID = '10000000-0000-4000-8000-000000000001';
const PET_UID = '20000000-0000-4000-8000-000000000001';
const TOY_UID = '20000000-0000-4000-8000-000000000002';
const PERSON_UID = '20000000-0000-4000-8000-000000000003';
const MISSING_UID = '20000000-0000-4000-8000-000000000004';
const OWNER_UID = '20000000-0000-4000-8000-000000000005';
const PET_NAME_FIELD_UID = '30000000-0000-4000-8000-000000000001';
const PET_SECRET_FIELD_UID = '30000000-0000-4000-8000-000000000002';
const TOY_NAME_FIELD_UID = '30000000-0000-4000-8000-000000000003';
const SUPPORT_ROLE_UID = '40000000-0000-4000-8000-000000000001';
const ADMIN_ROLE_UID = '40000000-0000-4000-8000-000000000002';
const EXPORT_PETS_FLAG_UID = '50000000-0000-4000-8000-000000000001';
const WORKSPACE_FLAG_UID = '50000000-0000-4000-8000-000000000002';
const PERSON_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000001';
const PET_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000002';
const TOY_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000003';
const MISSING_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000004';
const ADMIN_OBJECT_PERMISSION_UID = '60000000-0000-4000-8000-000000000005';
const PET_NAME_FIELD_PERMISSION_UID = '70000000-0000-4000-8000-000000000001';
const PET_SECRET_FIELD_PERMISSION_UID = '70000000-0000-4000-8000-000000000002';
const TOY_NAME_FIELD_PERMISSION_UID = '70000000-0000-4000-8000-000000000003';
const WORKSPACE_ROLE_PERMISSION_FLAG_UID =
  '80000000-0000-4000-8000-000000000001';
const EXPORT_PETS_ROLE_PERMISSION_FLAG_UID =
  '80000000-0000-4000-8000-000000000002';
const MISSING_ROLE_PERMISSION_FLAG_UID = '80000000-0000-4000-8000-000000000003';
const ROOT_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000001';
const CHILD_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000002';
const TOY_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000003';
const TOY_CHILD_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000004';
const ORPHAN_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000005';
const DELETED_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000006';
const FIRST_CYCLIC_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000007';
const SECOND_CYCLIC_PREDICATE_GROUP_UID =
  '90000000-0000-4000-8000-000000000008';
const OWNER_PREDICATE_GROUP_UID = '90000000-0000-4000-8000-000000000009';
const CROSS_OBJECT_CHILD_PREDICATE_GROUP_UID =
  '90000000-0000-4000-8000-00000000000a';
const CHILD_GROUP_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000001';
const PET_SECRET_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000002';
const PET_SECRET_WORKSPACE_MEMBER_PREDICATE_UID =
  'a0000000-0000-4000-8000-000000000003';
const TOY_CHILD_GROUP_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000004';
const DELETED_GROUP_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000005';
const ADMIN_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000006';
const DELETED_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000007';
const CROSS_OBJECT_GROUP_PREDICATE_UID = 'a0000000-0000-4000-8000-000000000008';

const withIds = <TUniversalFlatEntity extends { universalIdentifier: string }>(
  universalFlatEntity: TUniversalFlatEntity,
  applicationId = APP_ID,
) => ({
  ...universalFlatEntity,
  id: `${universalFlatEntity.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId,
});

const buildFlatObject = (
  universalIdentifier: string,
  nameSingular: string,
  applicationId = APP_ID,
): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier: APP_UID,
    nameSingular,
    namePlural: `${nameSingular}s`,
  });

const buildFlatField = (
  universalIdentifier: string,
  objectMetadataUniversalIdentifier: string,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    type: FieldMetadataType.TEXT,
    objectMetadataId: `${objectMetadataUniversalIdentifier}-id`,
    objectMetadataUniversalIdentifier,
    applicationId: APP_ID,
    applicationUniversalIdentifier: APP_UID,
  });

const buildFlatRole = (
  universalIdentifier: string,
  label: string,
  applicationId = APP_ID,
): FlatRole =>
  withIds(
    fromRoleManifestToUniversalFlatRole({
      roleManifest: { universalIdentifier, label },
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
    applicationId,
  ) as FlatRole;

const buildFlatPermissionFlag = (
  universalIdentifier: string,
  key: string,
  applicationId = APP_ID,
): FlatPermissionFlag =>
  withIds(
    fromPermissionFlagManifestToUniversalFlatPermissionFlag({
      permissionFlagManifest: {
        universalIdentifier,
        key,
        label: key,
        permissionType: 'settings',
      },
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
    applicationId,
  ) as FlatPermissionFlag;

const buildFlatObjectPermission = ({
  universalIdentifier,
  roleUniversalIdentifier = SUPPORT_ROLE_UID,
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
      roleUniversalIdentifier: SUPPORT_ROLE_UID,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
  ) as FlatFieldPermission;

const buildFlatRolePermissionFlag = (
  universalIdentifier: string,
  permissionFlagUniversalIdentifier: string,
): FlatRolePermissionFlag =>
  withIds({
    ...fromPermissionFlagToUniversalFlatRolePermissionFlag({
      permissionFlagUniversalIdentifier,
      roleUniversalIdentifier: SUPPORT_ROLE_UID,
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
    universalIdentifier,
  }) as FlatRolePermissionFlag;

const buildFlatPredicateGroup = ({
  universalIdentifier,
  objectUniversalIdentifier = PET_UID,
  parentPredicateGroupUniversalIdentifier,
  deletedAt = null,
}: {
  universalIdentifier: string;
  objectUniversalIdentifier?: string;
  parentPredicateGroupUniversalIdentifier?: string;
  deletedAt?: string | null;
}): FlatRowLevelPermissionPredicateGroup =>
  withIds({
    ...fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup(
      {
        rowLevelPermissionPredicateGroupManifest: {
          universalIdentifier,
          objectUniversalIdentifier,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          parentPredicateGroupUniversalIdentifier,
        },
        roleUniversalIdentifier: SUPPORT_ROLE_UID,
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      },
    ),
    deletedAt,
  }) as FlatRowLevelPermissionPredicateGroup;

const buildFlatPredicate = ({
  universalIdentifier,
  roleUniversalIdentifier = SUPPORT_ROLE_UID,
  fieldUniversalIdentifier = PET_NAME_FIELD_UID,
  workspaceMemberFieldUniversalIdentifier,
  predicateGroupUniversalIdentifier,
  deletedAt = null,
}: {
  universalIdentifier: string;
  roleUniversalIdentifier?: string;
  fieldUniversalIdentifier?: string;
  workspaceMemberFieldUniversalIdentifier?: string;
  predicateGroupUniversalIdentifier?: string;
  deletedAt?: string | null;
}): FlatRowLevelPermissionPredicate =>
  withIds({
    ...fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
      {
        rowLevelPermissionPredicateManifest: {
          universalIdentifier,
          objectUniversalIdentifier: PET_UID,
          fieldUniversalIdentifier,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value: 'bug',
          workspaceMemberFieldUniversalIdentifier,
          predicateGroupUniversalIdentifier,
        },
        roleUniversalIdentifier,
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      },
    ),
    deletedAt,
  }) as FlatRowLevelPermissionPredicate;

const buildMaps = ({
  objects = [],
  fields = [],
  roles = [],
  permissionFlags = [],
  objectPermissions = [],
  fieldPermissions = [],
  rolePermissionFlags = [],
  predicateGroups = [],
  predicates = [],
}: {
  objects?: FlatObjectMetadata[];
  fields?: FlatFieldMetadata[];
  roles?: FlatRole[];
  permissionFlags?: FlatPermissionFlag[];
  objectPermissions?: FlatObjectPermission[];
  fieldPermissions?: FlatFieldPermission[];
  rolePermissionFlags?: FlatRolePermissionFlag[];
  predicateGroups?: FlatRowLevelPermissionPredicateGroup[];
  predicates?: FlatRowLevelPermissionPredicate[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: objects,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
    flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: fields,
      flatEntityMaps: maps.flatFieldMetadataMaps,
    }),
    flatRoleMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: roles,
      flatEntityMaps: maps.flatRoleMaps,
    }),
    flatPermissionFlagMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: permissionFlags,
      flatEntityMaps: maps.flatPermissionFlagMaps,
    }),
    flatObjectPermissionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: objectPermissions,
      flatEntityMaps: maps.flatObjectPermissionMaps,
    }),
    flatFieldPermissionMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: fieldPermissions,
      flatEntityMaps: maps.flatFieldPermissionMaps,
    }),
    flatRolePermissionFlagMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: rolePermissionFlags,
      flatEntityMaps: maps.flatRolePermissionFlagMaps,
    }),
    flatRowLevelPermissionPredicateGroupMaps:
      addAllFlatEntitiesToFlatEntityMaps({
        flatEntities: predicateGroups,
        flatEntityMaps: maps.flatRowLevelPermissionPredicateGroupMaps,
      }),
    flatRowLevelPermissionPredicateMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: predicates,
      flatEntityMaps: maps.flatRowLevelPermissionPredicateMaps,
    }),
  };
};

const applicationObjects = [
  buildFlatObject(PET_UID, 'pet'),
  buildFlatObject(TOY_UID, 'toy'),
  buildFlatObject(OWNER_UID, 'owner'),
];
const applicationFields = [
  buildFlatField(PET_NAME_FIELD_UID, PET_UID),
  buildFlatField(PET_SECRET_FIELD_UID, PET_UID),
  buildFlatField(TOY_NAME_FIELD_UID, TOY_UID),
];
const applicationRoles = [buildFlatRole(SUPPORT_ROLE_UID, 'Support')];
const applicationPermissionFlags = [
  buildFlatPermissionFlag(EXPORT_PETS_FLAG_UID, 'EXPORT_PETS'),
];
const applicationObjectPermissions = [
  buildFlatObjectPermission({
    universalIdentifier: PERSON_OBJECT_PERMISSION_UID,
    objectUniversalIdentifier: PERSON_UID,
  }),
  buildFlatObjectPermission({
    universalIdentifier: PET_OBJECT_PERMISSION_UID,
    objectUniversalIdentifier: PET_UID,
  }),
  buildFlatObjectPermission({
    universalIdentifier: TOY_OBJECT_PERMISSION_UID,
    objectUniversalIdentifier: TOY_UID,
  }),
  buildFlatObjectPermission({
    universalIdentifier: MISSING_OBJECT_PERMISSION_UID,
    objectUniversalIdentifier: MISSING_UID,
  }),
  buildFlatObjectPermission({
    universalIdentifier: ADMIN_OBJECT_PERMISSION_UID,
    roleUniversalIdentifier: ADMIN_ROLE_UID,
    objectUniversalIdentifier: PET_UID,
  }),
];
const applicationFieldPermissions = [
  buildFlatFieldPermission({
    universalIdentifier: PET_NAME_FIELD_PERMISSION_UID,
    objectUniversalIdentifier: PET_UID,
    fieldUniversalIdentifier: PET_NAME_FIELD_UID,
  }),
  buildFlatFieldPermission({
    universalIdentifier: PET_SECRET_FIELD_PERMISSION_UID,
    objectUniversalIdentifier: PET_UID,
    fieldUniversalIdentifier: PET_SECRET_FIELD_UID,
  }),
  buildFlatFieldPermission({
    universalIdentifier: TOY_NAME_FIELD_PERMISSION_UID,
    objectUniversalIdentifier: TOY_UID,
    fieldUniversalIdentifier: TOY_NAME_FIELD_UID,
  }),
];
const applicationRolePermissionFlags = [
  buildFlatRolePermissionFlag(
    WORKSPACE_ROLE_PERMISSION_FLAG_UID,
    WORKSPACE_FLAG_UID,
  ),
  buildFlatRolePermissionFlag(
    EXPORT_PETS_ROLE_PERMISSION_FLAG_UID,
    EXPORT_PETS_FLAG_UID,
  ),
  buildFlatRolePermissionFlag(MISSING_ROLE_PERMISSION_FLAG_UID, MISSING_UID),
];
const applicationPredicateGroups = [
  buildFlatPredicateGroup({ universalIdentifier: ROOT_PREDICATE_GROUP_UID }),
  buildFlatPredicateGroup({
    universalIdentifier: CHILD_PREDICATE_GROUP_UID,
    parentPredicateGroupUniversalIdentifier: ROOT_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: TOY_PREDICATE_GROUP_UID,
    objectUniversalIdentifier: TOY_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: TOY_CHILD_PREDICATE_GROUP_UID,
    parentPredicateGroupUniversalIdentifier: TOY_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: ORPHAN_PREDICATE_GROUP_UID,
    parentPredicateGroupUniversalIdentifier: MISSING_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: DELETED_PREDICATE_GROUP_UID,
    deletedAt: NOW,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: FIRST_CYCLIC_PREDICATE_GROUP_UID,
    parentPredicateGroupUniversalIdentifier: SECOND_CYCLIC_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: SECOND_CYCLIC_PREDICATE_GROUP_UID,
    parentPredicateGroupUniversalIdentifier: FIRST_CYCLIC_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: OWNER_PREDICATE_GROUP_UID,
    objectUniversalIdentifier: OWNER_UID,
  }),
  buildFlatPredicateGroup({
    universalIdentifier: CROSS_OBJECT_CHILD_PREDICATE_GROUP_UID,
    parentPredicateGroupUniversalIdentifier: OWNER_PREDICATE_GROUP_UID,
  }),
];
const applicationPredicates = [
  buildFlatPredicate({
    universalIdentifier: CHILD_GROUP_PREDICATE_UID,
    predicateGroupUniversalIdentifier: CHILD_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicate({
    universalIdentifier: PET_SECRET_PREDICATE_UID,
    fieldUniversalIdentifier: PET_SECRET_FIELD_UID,
  }),
  buildFlatPredicate({
    universalIdentifier: PET_SECRET_WORKSPACE_MEMBER_PREDICATE_UID,
    workspaceMemberFieldUniversalIdentifier: PET_SECRET_FIELD_UID,
  }),
  buildFlatPredicate({
    universalIdentifier: TOY_CHILD_GROUP_PREDICATE_UID,
    predicateGroupUniversalIdentifier: TOY_CHILD_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicate({
    universalIdentifier: DELETED_GROUP_PREDICATE_UID,
    predicateGroupUniversalIdentifier: DELETED_PREDICATE_GROUP_UID,
  }),
  buildFlatPredicate({
    universalIdentifier: ADMIN_PREDICATE_UID,
    roleUniversalIdentifier: ADMIN_ROLE_UID,
  }),
  buildFlatPredicate({
    universalIdentifier: DELETED_PREDICATE_UID,
    deletedAt: NOW,
  }),
  buildFlatPredicate({
    universalIdentifier: CROSS_OBJECT_GROUP_PREDICATE_UID,
    predicateGroupUniversalIdentifier: OWNER_PREDICATE_GROUP_UID,
  }),
];

const applicationAllFlatEntityMaps = buildMaps({
  objects: applicationObjects,
  fields: applicationFields,
  roles: applicationRoles,
  permissionFlags: applicationPermissionFlags,
  objectPermissions: applicationObjectPermissions,
  fieldPermissions: applicationFieldPermissions,
  rolePermissionFlags: applicationRolePermissionFlags,
  predicateGroups: applicationPredicateGroups,
  predicates: applicationPredicates,
});

const allFlatEntityMaps = buildMaps({
  objects: [
    ...applicationObjects,
    buildFlatObject(PERSON_UID, 'person', STANDARD_APP_ID),
  ],
  fields: applicationFields,
  roles: [
    ...applicationRoles,
    buildFlatRole(ADMIN_ROLE_UID, 'Admin', STANDARD_APP_ID),
  ],
  permissionFlags: [
    ...applicationPermissionFlags,
    buildFlatPermissionFlag(WORKSPACE_FLAG_UID, 'WORKSPACE', STANDARD_APP_ID),
  ],
  objectPermissions: applicationObjectPermissions,
  fieldPermissions: applicationFieldPermissions,
  rolePermissionFlags: applicationRolePermissionFlags,
  predicateGroups: applicationPredicateGroups,
  predicates: applicationPredicates,
});

const reconstruct = () =>
  reconstructRolesManifest({
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers: new Set([PET_UID, OWNER_UID]),
    resolvableFieldUniversalIdentifiers: new Set([PET_NAME_FIELD_UID]),
  });

const isSoftDeleted = ({ deletedAt }: { deletedAt: string | null }) =>
  isDefined(deletedAt);

describe('reconstructRolesManifest', () => {
  it('should export the permission flags the application declares', () => {
    expect(reconstruct().permissionFlags).toEqual([
      {
        universalIdentifier: EXPORT_PETS_FLAG_UID,
        key: 'EXPORT_PETS',
        label: 'EXPORT_PETS',
        permissionType: 'settings',
      },
    ]);
  });

  it('should nest the resolvable permissions under their role and sort its permission flags', () => {
    expect(reconstruct().roles).toEqual([
      expect.objectContaining({
        universalIdentifier: SUPPORT_ROLE_UID,
        label: 'Support',
        objectPermissions: [
          {
            universalIdentifier: PERSON_OBJECT_PERMISSION_UID,
            objectUniversalIdentifier: PERSON_UID,
            canReadObjectRecords: true,
          },
          {
            universalIdentifier: PET_OBJECT_PERMISSION_UID,
            objectUniversalIdentifier: PET_UID,
            canReadObjectRecords: true,
          },
        ],
        fieldPermissions: [
          {
            universalIdentifier: PET_NAME_FIELD_PERMISSION_UID,
            objectUniversalIdentifier: PET_UID,
            fieldUniversalIdentifier: PET_NAME_FIELD_UID,
            canUpdateFieldValue: false,
          },
        ],
        permissionFlagUniversalIdentifiers: [
          EXPORT_PETS_FLAG_UID,
          WORKSPACE_FLAG_UID,
        ],
      }),
    ]);
  });

  it('should nest the exported predicate groups and the predicates they contain under their role', () => {
    expect(reconstruct().roles).toEqual([
      expect.objectContaining({
        universalIdentifier: SUPPORT_ROLE_UID,
        rowLevelPermissionPredicateGroups: [
          {
            universalIdentifier: ROOT_PREDICATE_GROUP_UID,
            objectUniversalIdentifier: PET_UID,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
          {
            universalIdentifier: CHILD_PREDICATE_GROUP_UID,
            objectUniversalIdentifier: PET_UID,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentPredicateGroupUniversalIdentifier: ROOT_PREDICATE_GROUP_UID,
          },
          {
            universalIdentifier: OWNER_PREDICATE_GROUP_UID,
            objectUniversalIdentifier: OWNER_UID,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        rowLevelPermissionPredicates: [
          {
            universalIdentifier: CHILD_GROUP_PREDICATE_UID,
            objectUniversalIdentifier: PET_UID,
            fieldUniversalIdentifier: PET_NAME_FIELD_UID,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'bug',
            predicateGroupUniversalIdentifier: CHILD_PREDICATE_GROUP_UID,
          },
        ],
      }),
    ]);
  });

  it('should report the permissions it cannot export with a reason', () => {
    expect(reconstruct().coverage).toEqual(
      expect.arrayContaining([
        {
          metadataName: 'objectPermission',
          universalIdentifier: TOY_OBJECT_PERMISSION_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'object permission on an unsupported object',
        },
        {
          metadataName: 'objectPermission',
          universalIdentifier: MISSING_OBJECT_PERMISSION_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'object permission on an object that does not exist',
        },
        {
          metadataName: 'objectPermission',
          universalIdentifier: ADMIN_OBJECT_PERMISSION_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'object permission on a role outside the application',
        },
        {
          metadataName: 'fieldPermission',
          universalIdentifier: PET_SECRET_FIELD_PERMISSION_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'field permission on an unsupported field',
        },
        {
          metadataName: 'fieldPermission',
          universalIdentifier: TOY_NAME_FIELD_PERMISSION_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'field permission on an unsupported object',
        },
        {
          metadataName: 'rolePermissionFlag',
          universalIdentifier: MISSING_ROLE_PERMISSION_FLAG_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason:
            'role permission flag on a permission flag that does not exist',
        },
      ]),
    );
  });

  it('should report the predicate groups and predicates it cannot export with a reason', () => {
    const groupNotExportedReason =
      'row-level permission predicate group in a row-level permission predicate group that is not exported';
    const predicateNotExportedReason =
      'row-level permission predicate in a row-level permission predicate group that is not exported';

    expect(reconstruct().coverage).toEqual(
      expect.arrayContaining([
        {
          metadataName: 'rowLevelPermissionPredicateGroup',
          universalIdentifier: TOY_PREDICATE_GROUP_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason:
            'row-level permission predicate group on an unsupported object',
        },
        {
          metadataName: 'rowLevelPermissionPredicateGroup',
          universalIdentifier: TOY_CHILD_PREDICATE_GROUP_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: groupNotExportedReason,
        },
        {
          metadataName: 'rowLevelPermissionPredicateGroup',
          universalIdentifier: ORPHAN_PREDICATE_GROUP_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: groupNotExportedReason,
        },
        {
          metadataName: 'rowLevelPermissionPredicateGroup',
          universalIdentifier: FIRST_CYCLIC_PREDICATE_GROUP_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: groupNotExportedReason,
        },
        {
          metadataName: 'rowLevelPermissionPredicateGroup',
          universalIdentifier: SECOND_CYCLIC_PREDICATE_GROUP_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: groupNotExportedReason,
        },
        {
          metadataName: 'rowLevelPermissionPredicate',
          universalIdentifier: PET_SECRET_PREDICATE_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'row-level permission predicate on an unsupported field',
        },
        {
          metadataName: 'rowLevelPermissionPredicate',
          universalIdentifier: PET_SECRET_WORKSPACE_MEMBER_PREDICATE_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: 'row-level permission predicate on an unsupported field',
        },
        {
          metadataName: 'rowLevelPermissionPredicate',
          universalIdentifier: TOY_CHILD_GROUP_PREDICATE_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: predicateNotExportedReason,
        },
        {
          metadataName: 'rowLevelPermissionPredicate',
          universalIdentifier: DELETED_GROUP_PREDICATE_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: predicateNotExportedReason,
        },
        {
          metadataName: 'rowLevelPermissionPredicate',
          universalIdentifier: ADMIN_PREDICATE_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason:
            'row-level permission predicate on a role outside the application',
        },
      ]),
    );
  });

  it('should not export a predicate group or a predicate attached to an exported group on another object', () => {
    expect(reconstruct().coverage).toEqual(
      expect.arrayContaining([
        {
          metadataName: 'rowLevelPermissionPredicateGroup',
          universalIdentifier: CROSS_OBJECT_CHILD_PREDICATE_GROUP_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason:
            'row-level permission predicate group in a row-level permission predicate group that is not exported',
        },
        {
          metadataName: 'rowLevelPermissionPredicate',
          universalIdentifier: CROSS_OBJECT_GROUP_PREDICATE_UID,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason:
            'row-level permission predicate in a row-level permission predicate group that is not exported',
        },
      ]),
    );
  });

  it('should cover every application-owned role, permission flag and permission exactly once and leave soft-deleted predicates to the classifier', () => {
    const coverageKeys = reconstruct().coverage.map(
      ({ metadataName, universalIdentifier }) =>
        `${metadataName}:${universalIdentifier}`,
    );

    expect(coverageKeys).toHaveLength(new Set(coverageKeys).size);
    expect(new Set(coverageKeys)).toEqual(
      new Set([
        `role:${SUPPORT_ROLE_UID}`,
        `permissionFlag:${EXPORT_PETS_FLAG_UID}`,
        ...applicationObjectPermissions.map(
          ({ universalIdentifier }) =>
            `objectPermission:${universalIdentifier}`,
        ),
        ...applicationFieldPermissions.map(
          ({ universalIdentifier }) => `fieldPermission:${universalIdentifier}`,
        ),
        ...applicationRolePermissionFlags.map(
          ({ universalIdentifier }) =>
            `rolePermissionFlag:${universalIdentifier}`,
        ),
        ...applicationPredicateGroups
          .filter((flatPredicateGroup) => !isSoftDeleted(flatPredicateGroup))
          .map(
            ({ universalIdentifier }) =>
              `rowLevelPermissionPredicateGroup:${universalIdentifier}`,
          ),
        ...applicationPredicates
          .filter((flatPredicate) => !isSoftDeleted(flatPredicate))
          .map(
            ({ universalIdentifier }) =>
              `rowLevelPermissionPredicate:${universalIdentifier}`,
          ),
      ]),
    );
  });
});
