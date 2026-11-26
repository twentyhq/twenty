import { type MarketplaceApplicationRoleCloneFlatEntityMaps } from 'src/database/commands/upgrade-version-command/2-65/utils/build-marketplace-application-role-clone.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const APPLICATION = '7d1f2c4e-3b5a-4c6d-8e9f-0a1b2c3d4e5f';
export const WORKSPACE_CUSTOM_APPLICATION =
  '2a3b4c5d-6e7f-4a8b-9c0d-1e2f3a4b5c6d';
export const NOW = '2026-11-26T00:00:00.000Z';

const toMaps = <
  TFlatEntity extends { id: string; universalIdentifier: string },
>(
  flatEntities: TFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map(({ id, universalIdentifier }) => [
      id,
      universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

export const buildFlatRole = (
  overrides: Partial<FlatRole> & { universalIdentifier: string },
): FlatRole =>
  ({
    id: `${overrides.universalIdentifier}-id`,
    label: overrides.universalIdentifier,
    description: null,
    icon: null,
    applicationId: `${APPLICATION}-id`,
    applicationUniversalIdentifier: APPLICATION,
    workspaceId: 'workspace-id',
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    canAccessAllAgentChatChannels: false,
    canReadAllObjectRecords: false,
    canCreateAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: true,
    canBeAssignedToApplications: false,
    isEditable: true,
    isSystemSideEffect: false,
    roleTargetUniversalIdentifiers: [],
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    rowLevelPermissionRuleUniversalIdentifiers: [],
    rolePermissionFlagUniversalIdentifiers: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    agentChatChannelRoleUniversalIdentifiers: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }) as FlatRole;

export const buildFlatRoleTarget = (
  overrides: Partial<FlatRoleTarget> & {
    universalIdentifier: string;
    roleUniversalIdentifier: string;
  },
): FlatRoleTarget =>
  ({
    id: `${overrides.universalIdentifier}-id`,
    applicationId: `${WORKSPACE_CUSTOM_APPLICATION}-id`,
    applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    workspaceId: 'workspace-id',
    roleId: `${overrides.roleUniversalIdentifier}-id`,
    isSystemSideEffect: false,
    userWorkspaceId: null,
    apiKeyId: null,
    agentId: null,
    agentUniversalIdentifier: null,
    webhookId: null,
    webhookUniversalIdentifier: null,
    targetApplicationUniversalIdentifier: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }) as FlatRoleTarget;

// A requested role with every kind of permission row, all owned by the marketplace application
export const buildRequestedRoleFixture = () => {
  const owner = {
    applicationId: `${APPLICATION}-id`,
    applicationUniversalIdentifier: APPLICATION,
    workspaceId: 'workspace-id',
    roleId: 'requested-role-id',
    roleUniversalIdentifier: 'requested-role',
    createdAt: NOW,
    updatedAt: NOW,
  };

  const objectPermission = {
    ...owner,
    id: 'object-permission-id',
    universalIdentifier: 'object-permission',
    objectMetadataId: 'company-id',
    objectMetadataUniversalIdentifier: 'company',
    canReadObjectRecords: false,
    canCreateObjectRecords: null,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: null,
    canDestroyObjectRecords: null,
  };

  const rule = {
    ...owner,
    id: 'rule-id',
    universalIdentifier: 'rule',
    objectMetadataId: 'company-id',
    objectMetadataUniversalIdentifier: 'company',
    canReadRecords: true,
    canCreateRecords: false,
    canUpdateRecords: true,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    rowLevelPermissionPredicateGroupUniversalIdentifiers: ['group'],
    rowLevelPermissionPredicateUniversalIdentifiers: ['predicate'],
    fieldPermissionUniversalIdentifiers: ['rule-field-permission'],
  };

  const personRule = {
    ...rule,
    id: 'person-rule-id',
    universalIdentifier: 'person-rule',
    objectMetadataId: 'person-id',
    objectMetadataUniversalIdentifier: 'person',
    canUpdateRecords: false,
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
  };

  const group = {
    ...owner,
    id: 'group-id',
    universalIdentifier: 'group',
    objectMetadataId: 'company-id',
    objectMetadataUniversalIdentifier: 'company',
    parentRowLevelPermissionPredicateGroupId: null,
    parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
    rowLevelPermissionRuleId: 'rule-id',
    rowLevelPermissionRuleUniversalIdentifier: 'rule',
    logicalOperator: 'AND',
    positionInRowLevelPermissionPredicateGroup: null,
    canReadRecords: false,
    canCreateRecords: false,
    canUpdateRecords: false,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    deletedAt: null,
  };

  const predicate = {
    ...owner,
    id: 'predicate-id',
    universalIdentifier: 'predicate',
    objectMetadataId: 'company-id',
    objectMetadataUniversalIdentifier: 'company',
    fieldMetadataId: 'company-name-id',
    fieldMetadataUniversalIdentifier: 'company-name',
    operand: 'IS',
    value: 'Acme',
    rowLevelPermissionPredicateGroupId: 'group-id',
    rowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
    rowLevelPermissionRuleId: 'rule-id',
    rowLevelPermissionRuleUniversalIdentifier: 'rule',
    positionInRowLevelPermissionPredicateGroup: 0,
    deletedAt: null,
  };

  const fieldPermission = {
    ...owner,
    id: 'field-permission-id',
    universalIdentifier: 'field-permission',
    objectMetadataId: 'company-id',
    objectMetadataUniversalIdentifier: 'company',
    fieldMetadataId: 'company-name-id',
    fieldMetadataUniversalIdentifier: 'company-name',
    rowLevelPermissionPredicateGroupUniversalIdentifier: null,
    rowLevelPermissionRuleUniversalIdentifier: null,
    sourceFieldMetadataUniversalIdentifier: null,
    canReadFieldValue: false,
    canUpdateFieldValue: false,
  };

  const ruleFieldPermission = {
    ...fieldPermission,
    id: 'rule-field-permission-id',
    universalIdentifier: 'rule-field-permission',
    rowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
    rowLevelPermissionRuleUniversalIdentifier: 'rule',
    canReadFieldValue: null,
  };

  const rolePermissionFlag = {
    ...owner,
    id: 'role-permission-flag-id',
    universalIdentifier: 'role-permission-flag',
    permissionFlagUniversalIdentifier: 'permission-flag',
  };

  const requestedFlatRole = buildFlatRole({
    id: 'requested-role-id',
    universalIdentifier: 'requested-role',
    label: 'Requested role',
    canReadAllObjectRecords: true,
    objectPermissionUniversalIdentifiers: ['object-permission'],
    fieldPermissionUniversalIdentifiers: [
      'field-permission',
      'rule-field-permission',
    ],
    rowLevelPermissionRuleUniversalIdentifiers: ['rule', 'person-rule'],
    rolePermissionFlagUniversalIdentifiers: ['role-permission-flag'],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: ['group'],
    rowLevelPermissionPredicateUniversalIdentifiers: ['predicate'],
  });

  const flatEntityMaps = {
    flatRoleMaps: toMaps([requestedFlatRole]),
    flatObjectPermissionMaps: toMaps([objectPermission]),
    flatFieldPermissionMaps: toMaps([fieldPermission, ruleFieldPermission]),
    flatRolePermissionFlagMaps: toMaps([rolePermissionFlag]),
    flatRowLevelPermissionRuleMaps: toMaps([rule, personRule]),
    flatRowLevelPermissionPredicateGroupMaps: toMaps([group]),
    flatRowLevelPermissionPredicateMaps: toMaps([predicate]),
  } as unknown as MarketplaceApplicationRoleCloneFlatEntityMaps;

  return { requestedFlatRole, flatEntityMaps };
};

export const buildRoleTargetAndAgentMaps = ({
  flatRoleTargets,
  agents,
}: {
  flatRoleTargets: FlatRoleTarget[];
  agents: {
    universalIdentifier: string;
    applicationUniversalIdentifier: string;
  }[];
}) =>
  ({
    flatRoleTargetMaps: toMaps(flatRoleTargets),
    flatAgentMaps: toMaps(
      agents.map((agent) => ({
        ...agent,
        id: `${agent.universalIdentifier}-id`,
      })),
    ),
  }) as unknown as Pick<
    AllFlatEntityMaps,
    'flatRoleTargetMaps' | 'flatAgentMaps'
  >;

export const withFlatRoles = (
  flatEntityMaps: MarketplaceApplicationRoleCloneFlatEntityMaps,
  flatRoles: FlatRole[],
): MarketplaceApplicationRoleCloneFlatEntityMaps =>
  ({
    ...flatEntityMaps,
    flatRoleMaps: toMaps(flatRoles),
  }) as unknown as MarketplaceApplicationRoleCloneFlatEntityMaps;
