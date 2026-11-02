import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import {
  type ApplicationGrantFlatEntityMaps,
  buildApplicationGrantFlatEntityOperations,
} from 'src/engine/core-modules/application/application-grant/utils/build-application-grant-flat-entity-operations.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-flat-role-metadata.util';
import { type CreateStandardRoleArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/create-standard-role-flat-metadata.util';

const NOW = '2026-11-02T00:00:00.000Z';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '9a8b7c6d-0000-4000-8000-000000000001';
const APPLICATION_UNIVERSAL_IDENTIFIER = '9a8b7c6d-0000-4000-8000-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = '9a8b7c6d-0000-4000-8000-000000000003';
const FIELD_UNIVERSAL_IDENTIFIER = '9a8b7c6d-0000-4000-8000-000000000004';
const PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  '9a8b7c6d-0000-4000-8000-000000000005';

const targetFlatApplication = {
  name: 'Stripe',
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
};

const roleOwnedBy = (applicationUniversalIdentifier: string) => ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier: 'requested-role',
  createdAt: NOW,
  updatedAt: NOW,
});

const requestedObjectPermission = {
  ...roleOwnedBy(APPLICATION_UNIVERSAL_IDENTIFIER),
  id: 'requested-object-permission-id',
  universalIdentifier: 'requested-object-permission',
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: null,
} as FlatObjectPermission;

const requestedFieldPermission = {
  ...roleOwnedBy(APPLICATION_UNIVERSAL_IDENTIFIER),
  id: 'requested-field-permission-id',
  universalIdentifier: 'requested-field-permission',
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  canReadFieldValue: null,
  canUpdateFieldValue: false,
} as FlatFieldPermission;

const requestedRolePermissionFlag = {
  ...roleOwnedBy(APPLICATION_UNIVERSAL_IDENTIFIER),
  id: 'requested-role-permission-flag-id',
  universalIdentifier: 'requested-role-permission-flag',
  permissionFlagUniversalIdentifier: PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
} as FlatRolePermissionFlag;

const requestedParentGroup = {
  ...roleOwnedBy(APPLICATION_UNIVERSAL_IDENTIFIER),
  id: 'requested-parent-group-id',
  universalIdentifier: 'requested-parent-group',
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
  positionInRowLevelPermissionPredicateGroup: null,
  deletedAt: null,
} as FlatRowLevelPermissionPredicateGroup;

const requestedChildGroup = {
  ...requestedParentGroup,
  id: 'requested-child-group-id',
  universalIdentifier: 'requested-child-group',
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier:
    requestedParentGroup.universalIdentifier,
  positionInRowLevelPermissionPredicateGroup: 1,
} as FlatRowLevelPermissionPredicateGroup;

const requestedPredicate = {
  ...roleOwnedBy(APPLICATION_UNIVERSAL_IDENTIFIER),
  id: 'requested-predicate-id',
  universalIdentifier: 'requested-predicate',
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  relationFieldMetadataUniversalIdentifier: null,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: 'paid',
  subFieldName: null,
  workspaceMemberFieldMetadataUniversalIdentifier: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupUniversalIdentifier:
    requestedChildGroup.universalIdentifier,
  positionInRowLevelPermissionPredicateGroup: 0,
  deletedAt: null,
} as FlatRowLevelPermissionPredicate;

const buildFlatRole = (overrides: Partial<FlatRole>): FlatRole => ({
  ...STANDARD_FLAT_ROLE_METADATA_BUILDERS_BY_ROLE_NAME.admin({
    workspaceId: 'workspace-id',
    twentyStandardApplicationId: 'twenty-standard-application-id',
    now: NOW,
  } as Omit<CreateStandardRoleArgs, 'context'>),
  ...overrides,
});

const requestedFlatRole = buildFlatRole({
  id: 'requested-role-id',
  universalIdentifier: 'requested-role',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  label: 'Stripe requested role',
  description: 'What Stripe needs',
  icon: 'IconBrandStripe',
  isEditable: true,
  canUpdateAllSettings: false,
  canAccessAllTools: true,
  canAccessAllAgentChatChannels: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissionUniversalIdentifiers: [
    requestedObjectPermission.universalIdentifier,
  ],
  fieldPermissionUniversalIdentifiers: [
    requestedFieldPermission.universalIdentifier,
  ],
  rolePermissionFlagUniversalIdentifiers: [
    requestedRolePermissionFlag.universalIdentifier,
  ],
  rowLevelPermissionPredicateUniversalIdentifiers: [
    requestedPredicate.universalIdentifier,
  ],
  rowLevelPermissionPredicateGroupUniversalIdentifiers: [
    requestedChildGroup.universalIdentifier,
    requestedParentGroup.universalIdentifier,
  ],
});

const addAll = <TFlatEntity extends SyncableFlatEntity>(
  flatEntityMaps: FlatEntityMaps<TFlatEntity>,
  flatEntities: TFlatEntity[],
) =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (accumulator, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow<TFlatEntity>({
        flatEntity,
        flatEntityMaps: accumulator,
      }),
    flatEntityMaps,
  );

const buildFlatEntityMaps = ({
  flatRoles = [requestedFlatRole],
  flatObjectPermissions = [requestedObjectPermission],
}: {
  flatRoles?: FlatRole[];
  flatObjectPermissions?: FlatObjectPermission[];
} = {}): ApplicationGrantFlatEntityMaps => {
  const empty = createEmptyAllFlatEntityMaps();

  return {
    flatRoleMaps: addAll(empty.flatRoleMaps, flatRoles),
    flatObjectPermissionMaps: addAll(
      empty.flatObjectPermissionMaps,
      flatObjectPermissions,
    ),
    flatFieldPermissionMaps: addAll(empty.flatFieldPermissionMaps, [
      requestedFieldPermission,
    ]),
    flatRolePermissionFlagMaps: addAll(empty.flatRolePermissionFlagMaps, [
      requestedRolePermissionFlag,
    ]),
    flatRowLevelPermissionPredicateMaps: addAll(
      empty.flatRowLevelPermissionPredicateMaps,
      [requestedPredicate],
    ),
    flatRowLevelPermissionPredicateGroupMaps: addAll(
      empty.flatRowLevelPermissionPredicateGroupMaps,
      [requestedParentGroup, requestedChildGroup],
    ),
  };
};

const buildCreateOperations = ({
  flatEntityMaps = buildFlatEntityMaps(),
  requested = requestedFlatRole,
}: {
  flatEntityMaps?: ApplicationGrantFlatEntityMaps;
  requested?: FlatRole;
} = {}) =>
  buildApplicationGrantFlatEntityOperations({
    targetFlatApplication,
    requestedFlatRole: requested,
    existingGrantFlatRole: undefined,
    existingGrantFlatRoleTarget: undefined,
    workspaceCustomApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    flatEntityMaps,
    now: NOW,
  });

describe('buildApplicationGrantFlatEntityOperations', () => {
  describe('when the application has no grant yet', () => {
    const operations = buildCreateOperations();
    const [grantRole] = operations.role.flatEntityToCreate;
    const grantOwner = {
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      roleUniversalIdentifier: grantRole.universalIdentifier,
    };

    it('should create a non-editable copy of the requested role, assignable to applications and agents only', () => {
      expect(operations.role.flatEntityToCreate).toHaveLength(1);
      expect(grantRole).toMatchObject({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        label: 'Stripe role',
        description: requestedFlatRole.description,
        icon: requestedFlatRole.icon,
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canAccessAllAgentChatChannels: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        isEditable: false,
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApplications: true,
      });
      expect(grantRole.universalIdentifier).not.toBe(
        requestedFlatRole.universalIdentifier,
      );
    });

    it('should assign the grant to the application', () => {
      expect(operations.roleTarget.flatEntityToCreate).toEqual([
        expect.objectContaining({
          ...grantOwner,
          targetApplicationUniversalIdentifier:
            APPLICATION_UNIVERSAL_IDENTIFIER,
          userWorkspaceId: null,
          agentUniversalIdentifier: null,
          apiKeyId: null,
          webhookUniversalIdentifier: null,
        }),
      ]);
    });

    it('should copy object permissions, field permissions and permission flags', () => {
      expect(operations.objectPermission.flatEntityToCreate).toEqual([
        expect.objectContaining({
          ...grantOwner,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: null,
        }),
      ]);
      expect(operations.fieldPermission.flatEntityToCreate).toEqual([
        expect.objectContaining({
          ...grantOwner,
          objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
          canReadFieldValue: null,
          canUpdateFieldValue: false,
        }),
      ]);
      expect(operations.rolePermissionFlag.flatEntityToCreate).toEqual([
        expect.objectContaining({
          ...grantOwner,
          permissionFlagUniversalIdentifier:
            PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
        }),
      ]);
    });

    it('should copy row-level rules with their groups, rewiring them to the copied groups', () => {
      const copiedGroups =
        operations.rowLevelPermissionPredicateGroup.flatEntityToCreate;
      const copiedParentGroup = copiedGroups.find(
        ({ logicalOperator }) =>
          logicalOperator ===
          RowLevelPermissionPredicateGroupLogicalOperator.OR,
      );
      const copiedChildGroup = copiedGroups.find(
        ({ logicalOperator }) =>
          logicalOperator ===
          RowLevelPermissionPredicateGroupLogicalOperator.AND,
      );

      expect(copiedGroups).toHaveLength(2);
      expect(copiedParentGroup).toMatchObject({
        ...grantOwner,
        parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
      });
      expect(copiedChildGroup).toMatchObject({
        ...grantOwner,
        objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
        parentRowLevelPermissionPredicateGroupUniversalIdentifier:
          copiedParentGroup?.universalIdentifier,
        positionInRowLevelPermissionPredicateGroup: 1,
      });
      expect(operations.rowLevelPermissionPredicate.flatEntityToCreate).toEqual(
        [
          expect.objectContaining({
            ...grantOwner,
            objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
            operand: RowLevelPermissionPredicateOperand.IS,
            value: 'paid',
            rowLevelPermissionPredicateGroupUniversalIdentifier:
              copiedChildGroup?.universalIdentifier,
            positionInRowLevelPermissionPredicateGroup: 0,
          }),
        ],
      );
    });

    it('should never reuse the requested role entities', () => {
      const requestedUniversalIdentifiers = new Set([
        requestedObjectPermission.universalIdentifier,
        requestedFieldPermission.universalIdentifier,
        requestedRolePermissionFlag.universalIdentifier,
        requestedParentGroup.universalIdentifier,
        requestedChildGroup.universalIdentifier,
        requestedPredicate.universalIdentifier,
      ]);

      const createdUniversalIdentifiers = Object.values(operations).flatMap(
        ({ flatEntityToCreate }) =>
          flatEntityToCreate.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
      );

      expect(
        createdUniversalIdentifiers.filter((universalIdentifier) =>
          requestedUniversalIdentifiers.has(universalIdentifier),
        ),
      ).toEqual([]);
      expect(
        Object.values(operations).flatMap(
          ({ flatEntityToUpdate, flatEntityToDelete }) => [
            ...flatEntityToUpdate,
            ...flatEntityToDelete,
          ],
        ),
      ).toEqual([]);
    });
  });

  it('should suffix the label when it is taken', () => {
    const takenFlatRoles = ['Stripe role', 'Stripe role 2'].map(
      (label, index) =>
        buildFlatRole({
          id: `taken-role-id-${index}`,
          universalIdentifier: `taken-role-${index}`,
          label,
        }),
    );

    const operations = buildCreateOperations({
      flatEntityMaps: buildFlatEntityMaps({
        flatRoles: [requestedFlatRole, ...takenFlatRoles],
      }),
    });

    expect(operations.role.flatEntityToCreate[0].label).toBe('Stripe role 3');
  });

  it('should give twenty-standard a grant equivalent to Admin', () => {
    const adminFlatRole = buildFlatRole({});

    const operations = buildApplicationGrantFlatEntityOperations({
      targetFlatApplication: {
        name: TWENTY_STANDARD_APPLICATION.name,
        universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
      requestedFlatRole: adminFlatRole,
      existingGrantFlatRole: undefined,
      existingGrantFlatRoleTarget: undefined,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatEntityMaps: buildFlatEntityMaps({
        flatRoles: [adminFlatRole],
        flatObjectPermissions: [],
      }),
      now: NOW,
    });

    expect(operations.role.flatEntityToCreate[0]).toMatchObject({
      canUpdateAllSettings: true,
      canAccessAllTools: true,
      canAccessAllAgentChatChannels: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
    expect(
      [
        operations.objectPermission,
        operations.fieldPermission,
        operations.rolePermissionFlag,
        operations.rowLevelPermissionPredicate,
        operations.rowLevelPermissionPredicateGroup,
      ].map(({ flatEntityToCreate }) => flatEntityToCreate.length),
    ).toEqual([0, 0, 0, 0, 0]);
  });

  describe('when the application already has a grant', () => {
    const firstOperations = buildCreateOperations();
    const [createdGrantRole] = firstOperations.role.flatEntityToCreate;
    const [createdObjectPermission] =
      firstOperations.objectPermission.flatEntityToCreate;

    const staleObjectPermission = {
      ...createdObjectPermission,
      id: 'grant-object-permission-id',
      canUpdateObjectRecords: false,
    } as FlatObjectPermission;
    const extraObjectPermission = {
      ...createdObjectPermission,
      id: 'extra-object-permission-id',
      universalIdentifier: 'extra-object-permission',
      objectMetadataUniversalIdentifier: 'another-object',
    } as FlatObjectPermission;

    const existingGrantFlatRole = buildFlatRole({
      ...createdGrantRole,
      id: 'grant-role-id',
      canAccessAllTools: false,
      objectPermissionUniversalIdentifiers: [
        staleObjectPermission.universalIdentifier,
        extraObjectPermission.universalIdentifier,
      ],
    });

    const operations = buildApplicationGrantFlatEntityOperations({
      targetFlatApplication,
      requestedFlatRole,
      existingGrantFlatRole,
      existingGrantFlatRoleTarget: {
        universalIdentifier: 'grant-role-target',
      } as FlatRoleTarget,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      flatEntityMaps: buildFlatEntityMaps({
        flatRoles: [requestedFlatRole, existingGrantFlatRole],
        flatObjectPermissions: [
          requestedObjectPermission,
          staleObjectPermission,
          extraObjectPermission,
        ],
      }),
      now: NOW,
    });

    it('should rewrite the grant role to match the requested role and keep its label', () => {
      expect(operations.role.flatEntityToCreate).toEqual([]);
      expect(operations.role.flatEntityToUpdate).toEqual([
        expect.objectContaining({
          universalIdentifier: createdGrantRole.universalIdentifier,
          label: createdGrantRole.label,
          canAccessAllTools: true,
          isEditable: false,
        }),
      ]);
    });

    it('should not create a second application target', () => {
      expect(operations.roleTarget.flatEntityToCreate).toEqual([]);
    });

    it('should update changed copies in place and delete the ones no longer requested', () => {
      expect(operations.objectPermission.flatEntityToCreate).toEqual([]);
      expect(operations.objectPermission.flatEntityToUpdate).toEqual([
        expect.objectContaining({
          id: staleObjectPermission.id,
          universalIdentifier: staleObjectPermission.universalIdentifier,
          canUpdateObjectRecords: true,
        }),
      ]);
      expect(operations.objectPermission.flatEntityToDelete).toEqual([
        extraObjectPermission,
      ]);
    });
  });
});
