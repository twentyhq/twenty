import {
  classifyApplicationManifestRoles,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';

const removeRoleEntitiesThroughMutation = <
  TFlatEntity extends SyncableFlatEntity & { roleUniversalIdentifier: string },
  TUniversalFlatEntity extends UniversalSyncableFlatEntity & {
    roleUniversalIdentifier: string;
  },
>({
  roleUniversalIdentifiers,
  fromFlatEntityMapsToMutate,
  toUniversalFlatEntityMapsToMutate,
}: {
  roleUniversalIdentifiers: Set<string>;
  fromFlatEntityMapsToMutate: FlatEntityMaps<TFlatEntity>;
  toUniversalFlatEntityMapsToMutate: UniversalFlatEntityMaps<TUniversalFlatEntity>;
}): void => {
  for (const flatEntity of Object.values(
    fromFlatEntityMapsToMutate.byUniversalIdentifier,
  )) {
    if (
      isDefined(flatEntity) &&
      roleUniversalIdentifiers.has(flatEntity.roleUniversalIdentifier)
    ) {
      deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
        entityToDeleteId: flatEntity.id,
        flatEntityMapsToMutate: fromFlatEntityMapsToMutate,
      });
    }
  }

  for (const universalFlatEntity of Object.values(
    toUniversalFlatEntityMapsToMutate.byUniversalIdentifier,
  )) {
    if (
      isDefined(universalFlatEntity) &&
      roleUniversalIdentifiers.has(universalFlatEntity.roleUniversalIdentifier)
    ) {
      deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalIdentifierToDelete: universalFlatEntity.universalIdentifier,
          universalFlatEntityMapsToMutate: toUniversalFlatEntityMapsToMutate,
        },
      );
    }
  }
};

const computeFrozenRoleUniversalIdentifiers = ({
  manifest,
  ownerFlatApplication,
  fromAllFlatEntityMaps,
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
  ownerFlatApplication: Pick<FlatApplication, 'requestedRoleId'>;
  fromAllFlatEntityMaps: AllFlatEntityMaps;
}): Set<string> => {
  const { standaloneRoleUniversalIdentifiers } =
    classifyApplicationManifestRoles({ manifest });
  const { flatRoleMaps, flatRoleTargetMaps } = fromAllFlatEntityMaps;
  const declaredRoleUniversalIdentifiers = new Set(
    manifest.roles.map((role) => role.universalIdentifier),
  );
  const previouslyRequestedOrAgentRoleUniversalIdentifiers = new Set([
    ...(isDefined(ownerFlatApplication.requestedRoleId)
      ? [
          flatRoleMaps.universalIdentifierById[
            ownerFlatApplication.requestedRoleId
          ],
        ]
      : []),
    ...Object.values(flatRoleTargetMaps.byUniversalIdentifier)
      .filter((flatRoleTarget) => isDefined(flatRoleTarget?.agentId))
      .map((flatRoleTarget) => flatRoleTarget?.roleUniversalIdentifier),
  ]);
  // A dropped role that was the requested or an agent role is deleted as before
  const droppedStandaloneRoleUniversalIdentifiers = Object.keys(
    flatRoleMaps.byUniversalIdentifier,
  ).filter(
    (universalIdentifier) =>
      !declaredRoleUniversalIdentifiers.has(universalIdentifier) &&
      !previouslyRequestedOrAgentRoleUniversalIdentifiers.has(
        universalIdentifier,
      ),
  );

  return new Set([
    ...standaloneRoleUniversalIdentifiers,
    ...droppedStandaloneRoleUniversalIdentifiers,
  ]);
};

// Keeps standalone roles out of the diff: a new one is never created, and an
// installed one is neither updated nor deleted, since deleting a role cascades
// to its role targets and would leave its members with no role.
export const freezeStandaloneApplicationRolesThroughMutation = ({
  manifest,
  ownerFlatApplication,
  fromAllFlatEntityMapsToMutate,
  toAllUniversalFlatEntityMapsToMutate,
}: {
  manifest: Pick<Manifest, 'application' | 'roles' | 'agents'>;
  ownerFlatApplication: Pick<FlatApplication, 'requestedRoleId'>;
  fromAllFlatEntityMapsToMutate: AllFlatEntityMaps;
  toAllUniversalFlatEntityMapsToMutate: AllUniversalFlatEntityMaps;
}): void => {
  const frozenRoleUniversalIdentifiers = computeFrozenRoleUniversalIdentifiers({
    manifest,
    ownerFlatApplication,
    fromAllFlatEntityMaps: fromAllFlatEntityMapsToMutate,
  });

  // Role targets stay in the diff: an agent moving off a frozen role must lose its target
  removeRoleEntitiesThroughMutation({
    roleUniversalIdentifiers: frozenRoleUniversalIdentifiers,
    fromFlatEntityMapsToMutate:
      fromAllFlatEntityMapsToMutate.flatRolePermissionFlagMaps,
    toUniversalFlatEntityMapsToMutate:
      toAllUniversalFlatEntityMapsToMutate.flatRolePermissionFlagMaps,
  });
  removeRoleEntitiesThroughMutation({
    roleUniversalIdentifiers: frozenRoleUniversalIdentifiers,
    fromFlatEntityMapsToMutate:
      fromAllFlatEntityMapsToMutate.flatObjectPermissionMaps,
    toUniversalFlatEntityMapsToMutate:
      toAllUniversalFlatEntityMapsToMutate.flatObjectPermissionMaps,
  });
  removeRoleEntitiesThroughMutation({
    roleUniversalIdentifiers: frozenRoleUniversalIdentifiers,
    fromFlatEntityMapsToMutate:
      fromAllFlatEntityMapsToMutate.flatFieldPermissionMaps,
    toUniversalFlatEntityMapsToMutate:
      toAllUniversalFlatEntityMapsToMutate.flatFieldPermissionMaps,
  });
  removeRoleEntitiesThroughMutation({
    roleUniversalIdentifiers: frozenRoleUniversalIdentifiers,
    fromFlatEntityMapsToMutate:
      fromAllFlatEntityMapsToMutate.flatRowLevelPermissionRuleMaps,
    toUniversalFlatEntityMapsToMutate:
      toAllUniversalFlatEntityMapsToMutate.flatRowLevelPermissionRuleMaps,
  });
  removeRoleEntitiesThroughMutation({
    roleUniversalIdentifiers: frozenRoleUniversalIdentifiers,
    fromFlatEntityMapsToMutate:
      fromAllFlatEntityMapsToMutate.flatRowLevelPermissionPredicateGroupMaps,
    toUniversalFlatEntityMapsToMutate:
      toAllUniversalFlatEntityMapsToMutate.flatRowLevelPermissionPredicateGroupMaps,
  });
  removeRoleEntitiesThroughMutation({
    roleUniversalIdentifiers: frozenRoleUniversalIdentifiers,
    fromFlatEntityMapsToMutate:
      fromAllFlatEntityMapsToMutate.flatRowLevelPermissionPredicateMaps,
    toUniversalFlatEntityMapsToMutate:
      toAllUniversalFlatEntityMapsToMutate.flatRowLevelPermissionPredicateMaps,
  });

  for (const roleUniversalIdentifier of frozenRoleUniversalIdentifiers) {
    const fromFlatRole =
      fromAllFlatEntityMapsToMutate.flatRoleMaps.byUniversalIdentifier[
        roleUniversalIdentifier
      ];

    if (isDefined(fromFlatRole)) {
      deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
        entityToDeleteId: fromFlatRole.id,
        flatEntityMapsToMutate: fromAllFlatEntityMapsToMutate.flatRoleMaps,
      });
    }

    if (
      isDefined(
        toAllUniversalFlatEntityMapsToMutate.flatRoleMaps.byUniversalIdentifier[
          roleUniversalIdentifier
        ],
      )
    ) {
      deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalIdentifierToDelete: roleUniversalIdentifier,
          universalFlatEntityMapsToMutate:
            toAllUniversalFlatEntityMapsToMutate.flatRoleMaps,
        },
      );
    }
  }
};
