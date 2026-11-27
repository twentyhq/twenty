import omit from 'lodash.omit';
import { isDefined } from 'twenty-shared/utils';

import {
  buildMarketplaceApplicationRoleCleanup,
  type MarketplaceApplicationRoleCleanup,
} from 'src/database/commands/upgrade-version-command/2-66/utils/build-marketplace-application-role-cleanup.util';
import {
  buildMarketplaceApplicationRoleClone,
  computeMarketplaceApplicationRoleCloneLabel,
  getMarketplaceApplicationRoleCloneUniversalIdentifier,
  type MarketplaceApplicationRoleClone,
  type MarketplaceApplicationRoleCloneFlatEntityMaps,
} from 'src/database/commands/upgrade-version-command/2-66/utils/build-marketplace-application-role-clone.util';
import {
  findOutsideHolderFlatRoleTargets,
  selectMarketplaceApplicationRoles,
} from 'src/database/commands/upgrade-version-command/2-66/utils/select-marketplace-application-roles.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export type MarketplaceApplicationRoleHolderMove = {
  cloneRoleId: string;
  cloneRoleUniversalIdentifier: string;
  clone: MarketplaceApplicationRoleClone | undefined;
  holderFlatRoleTargets: FlatRoleTarget[];
  isWorkspaceDefaultRole: boolean;
  invitationIds: string[];
};

export type MarketplaceApplicationRoleMigrationPlan = {
  originalFlatRole: FlatRole;
  cleanup: MarketplaceApplicationRoleCleanup;
  holderMove: MarketplaceApplicationRoleHolderMove | undefined;
};

export type MarketplaceApplicationRoleMigrationSummary = {
  rolesCloned: number;
  membersMoved: number;
  apiKeysMoved: number;
  webhooksMoved: number;
  agentsMoved: number;
  defaultRolesMoved: number;
  invitationsRepointed: number;
  objectPermissionsWidened: number;
  rulesDropped: number;
  predicateGroupsDropped: number;
  predicatesDropped: number;
  fieldPermissionsDropped: number;
  rolesMadeAgentOnly: number;
};

export type PendingInvitation = { id: string; roleId: string };

type HolderKey =
  | 'userWorkspaceId'
  | 'apiKeyId'
  | 'webhookUniversalIdentifier'
  | 'agentUniversalIdentifier';

const countHolders = (
  flatRoleTargets: FlatRoleTarget[],
  holderKey: HolderKey,
): number =>
  flatRoleTargets.filter((flatRoleTarget) =>
    isDefined(flatRoleTarget[holderKey]),
  ).length;

export const planMarketplaceApplicationRoleMigration = ({
  flatApplication,
  workspaceCustomApplicationUniversalIdentifier,
  workspaceDefaultRoleId,
  pendingInvitations,
  flatEntityMaps,
  flatRoleTargetMaps,
  flatAgentMaps,
  generateId,
  now,
}: {
  flatApplication: Pick<
    FlatApplication,
    'universalIdentifier' | 'requestedRoleId'
  >;
  workspaceCustomApplicationUniversalIdentifier: string;
  workspaceDefaultRoleId: string | null;
  pendingInvitations: PendingInvitation[];
  flatEntityMaps: MarketplaceApplicationRoleCloneFlatEntityMaps;
  generateId: () => string;
  now: string;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps' | 'flatAgentMaps'
>): MarketplaceApplicationRoleMigrationPlan[] => {
  const { requestedAndAgentFlatRoles, ownAgentUniversalIdentifiers } =
    selectMarketplaceApplicationRoles({
      flatApplication,
      flatRoleMaps: flatEntityMaps.flatRoleMaps,
      flatRoleTargetMaps,
      flatAgentMaps,
    });

  const takenLabels = new Set(
    Object.values(flatEntityMaps.flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map(({ label }) => label),
  );

  return requestedAndAgentFlatRoles.map((originalFlatRole) => {
    const cleanup = buildMarketplaceApplicationRoleCleanup({
      originalFlatRole,
      flatEntityMaps,
      now,
    });

    const holderFlatRoleTargets = findOutsideHolderFlatRoleTargets({
      flatRole: originalFlatRole,
      flatRoleTargetMaps,
      ownAgentUniversalIdentifiers,
    });
    const isWorkspaceDefaultRole =
      workspaceDefaultRoleId === originalFlatRole.id;
    const invitationIds = pendingInvitations
      .filter(({ roleId }) => roleId === originalFlatRole.id)
      .map(({ id }) => id);

    if (
      holderFlatRoleTargets.length === 0 &&
      !isWorkspaceDefaultRole &&
      invitationIds.length === 0
    ) {
      return { originalFlatRole, cleanup, holderMove: undefined };
    }

    const existingCloneFlatRole =
      flatEntityMaps.flatRoleMaps.byUniversalIdentifier[
        getMarketplaceApplicationRoleCloneUniversalIdentifier({
          originalRoleUniversalIdentifier: originalFlatRole.universalIdentifier,
          workspaceCustomApplicationUniversalIdentifier,
        })
      ];

    if (isDefined(existingCloneFlatRole)) {
      return {
        originalFlatRole,
        cleanup,
        holderMove: {
          cloneRoleId: existingCloneFlatRole.id,
          cloneRoleUniversalIdentifier:
            existingCloneFlatRole.universalIdentifier,
          clone: undefined,
          holderFlatRoleTargets,
          isWorkspaceDefaultRole,
          invitationIds,
        },
      };
    }

    const isHeldBy = (holderKey: HolderKey) =>
      countHolders(holderFlatRoleTargets, holderKey) > 0;

    const clone = buildMarketplaceApplicationRoleClone({
      originalFlatRole,
      cloneRoleId: generateId(),
      label: computeMarketplaceApplicationRoleCloneLabel({
        originalLabel: originalFlatRole.label,
        takenLabels,
      }),
      // The 4a sync may already have turned the flags off, so the holders say what the clone must accept
      assignability: {
        canBeAssignedToUsers:
          originalFlatRole.canBeAssignedToUsers ||
          isWorkspaceDefaultRole ||
          invitationIds.length > 0 ||
          isHeldBy('userWorkspaceId'),
        canBeAssignedToApiKeys:
          originalFlatRole.canBeAssignedToApiKeys ||
          isHeldBy('apiKeyId') ||
          isHeldBy('webhookUniversalIdentifier'),
        canBeAssignedToAgents:
          originalFlatRole.canBeAssignedToAgents ||
          isHeldBy('agentUniversalIdentifier'),
      },
      workspaceCustomApplicationUniversalIdentifier,
      flatEntityMaps,
      now,
    });

    takenLabels.add(clone.role.label);

    return {
      originalFlatRole,
      cleanup,
      holderMove: {
        cloneRoleId: clone.role.id,
        cloneRoleUniversalIdentifier: clone.role.universalIdentifier,
        clone,
        holderFlatRoleTargets,
        isWorkspaceDefaultRole,
        invitationIds,
      },
    };
  });
};

type OperationsByMetadataName = AllFlatEntityOperationByMetadataName;

const addOperations = <TMetadataName extends keyof OperationsByMetadataName>(
  operations: OperationsByMetadataName,
  metadataName: TMetadataName,
  {
    toCreate = [],
    toUpdate = [],
    toDelete = [],
  }: {
    toCreate?: MetadataUniversalFlatEntity<TMetadataName>[];
    toUpdate?: MetadataUniversalFlatEntity<TMetadataName>[];
    toDelete?: MetadataUniversalFlatEntity<TMetadataName>[];
  },
) => {
  if (toCreate.length === 0 && toUpdate.length === 0 && toDelete.length === 0) {
    return;
  }

  const existing = operations[metadataName] ?? {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  operations[metadataName] = {
    flatEntityToCreate: [...existing.flatEntityToCreate, ...toCreate],
    flatEntityToUpdate: [...existing.flatEntityToUpdate, ...toUpdate],
    flatEntityToDelete: [...existing.flatEntityToDelete, ...toDelete],
  } as OperationsByMetadataName[TMetadataName];
};

const toMovedFlatRoleTarget = ({
  flatRoleTarget,
  cloneRoleUniversalIdentifier,
  now,
}: {
  flatRoleTarget: FlatRoleTarget;
  cloneRoleUniversalIdentifier: string;
  now: string;
}): MetadataUniversalFlatEntity<'roleTarget'> => ({
  ...omit(flatRoleTarget, [
    'id',
    'applicationId',
    'workspaceId',
    'roleId',
    'agentId',
    'webhookId',
    'targetApplicationId',
  ]),
  roleUniversalIdentifier: cloneRoleUniversalIdentifier,
  updatedAt: now,
});

// The clone and the moves are owned by the custom app, the cleanup by the marketplace app: one build each
export const buildMarketplaceApplicationRoleOperations = ({
  plans,
  now,
}: {
  plans: MarketplaceApplicationRoleMigrationPlan[];
  now: string;
}): {
  workspaceCustomApplicationOperations: OperationsByMetadataName;
  applicationOperations: OperationsByMetadataName;
  summary: MarketplaceApplicationRoleMigrationSummary;
} => {
  const workspaceCustomApplicationOperations: OperationsByMetadataName = {};
  const applicationOperations: OperationsByMetadataName = {};
  const summary: MarketplaceApplicationRoleMigrationSummary = {
    rolesCloned: 0,
    membersMoved: 0,
    apiKeysMoved: 0,
    webhooksMoved: 0,
    agentsMoved: 0,
    defaultRolesMoved: 0,
    invitationsRepointed: 0,
    objectPermissionsWidened: 0,
    rulesDropped: 0,
    predicateGroupsDropped: 0,
    predicatesDropped: 0,
    fieldPermissionsDropped: 0,
    rolesMadeAgentOnly: 0,
  };

  for (const { cleanup, holderMove } of plans) {
    if (isDefined(holderMove)) {
      const { clone, holderFlatRoleTargets } = holderMove;

      if (isDefined(clone)) {
        summary.rolesCloned++;
        addOperations(workspaceCustomApplicationOperations, 'role', {
          toCreate: [clone.role],
        });
        addOperations(
          workspaceCustomApplicationOperations,
          'objectPermission',
          {
            toCreate: clone.objectPermissions,
          },
        );
        addOperations(workspaceCustomApplicationOperations, 'fieldPermission', {
          toCreate: clone.fieldPermissions,
        });
        addOperations(
          workspaceCustomApplicationOperations,
          'rolePermissionFlag',
          {
            toCreate: clone.rolePermissionFlags,
          },
        );
        addOperations(
          workspaceCustomApplicationOperations,
          'rowLevelPermissionRule',
          { toCreate: clone.rowLevelPermissionRules },
        );
        addOperations(
          workspaceCustomApplicationOperations,
          'rowLevelPermissionPredicateGroup',
          { toCreate: clone.rowLevelPermissionPredicateGroups },
        );
        addOperations(
          workspaceCustomApplicationOperations,
          'rowLevelPermissionPredicate',
          { toCreate: clone.rowLevelPermissionPredicates },
        );
      }

      addOperations(workspaceCustomApplicationOperations, 'roleTarget', {
        toUpdate: holderFlatRoleTargets.map((flatRoleTarget) =>
          toMovedFlatRoleTarget({
            flatRoleTarget,
            cloneRoleUniversalIdentifier:
              holderMove.cloneRoleUniversalIdentifier,
            now,
          }),
        ),
      });

      summary.membersMoved += countHolders(
        holderFlatRoleTargets,
        'userWorkspaceId',
      );
      summary.apiKeysMoved += countHolders(holderFlatRoleTargets, 'apiKeyId');
      summary.webhooksMoved += countHolders(
        holderFlatRoleTargets,
        'webhookUniversalIdentifier',
      );
      summary.agentsMoved += countHolders(
        holderFlatRoleTargets,
        'agentUniversalIdentifier',
      );

      summary.defaultRolesMoved += holderMove.isWorkspaceDefaultRole ? 1 : 0;
      summary.invitationsRepointed += holderMove.invitationIds.length;
    }

    addOperations(applicationOperations, 'role', {
      toUpdate: isDefined(cleanup.roleToUpdate) ? [cleanup.roleToUpdate] : [],
    });
    addOperations(applicationOperations, 'objectPermission', {
      toCreate: cleanup.objectPermissionsToCreate,
      toUpdate: cleanup.objectPermissionsToUpdate,
    });
    addOperations(applicationOperations, 'fieldPermission', {
      toDelete: cleanup.fieldPermissionsToDelete,
    });
    addOperations(applicationOperations, 'rowLevelPermissionRule', {
      toDelete: cleanup.rowLevelPermissionRulesToDelete,
    });
    addOperations(applicationOperations, 'rowLevelPermissionPredicateGroup', {
      toDelete: cleanup.rowLevelPermissionPredicateGroupsToDelete,
    });
    addOperations(applicationOperations, 'rowLevelPermissionPredicate', {
      toDelete: cleanup.rowLevelPermissionPredicatesToDelete,
    });

    summary.objectPermissionsWidened +=
      cleanup.objectPermissionsToCreate.length +
      cleanup.objectPermissionsToUpdate.length;
    summary.rulesDropped += cleanup.rowLevelPermissionRulesToDelete.length;
    summary.predicateGroupsDropped +=
      cleanup.rowLevelPermissionPredicateGroupsToDelete.length;
    summary.predicatesDropped +=
      cleanup.rowLevelPermissionPredicatesToDelete.length;
    summary.fieldPermissionsDropped += cleanup.fieldPermissionsToDelete.length;
    summary.rolesMadeAgentOnly += isDefined(cleanup.roleToUpdate) ? 1 : 0;
  }

  return {
    workspaceCustomApplicationOperations,
    applicationOperations,
    summary,
  };
};
