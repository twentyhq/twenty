import { isDefined } from 'twenty-shared/utils';

import { isSameRowLevelPermissionScope } from 'src/engine/core-modules/application/application-manifest/utils/is-same-row-level-permission-scope.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';

export const computeExportedRowLevelPermissionPredicateGroupUniversalIdentifiers =
  ({
    flatRowLevelPermissionPredicateGroupMaps,
    isExportableOnItsOwn,
  }: {
    flatRowLevelPermissionPredicateGroupMaps: AllFlatEntityMaps['flatRowLevelPermissionPredicateGroupMaps'];
    isExportableOnItsOwn: (
      flatRowLevelPermissionPredicateGroup: UniversalFlatRowLevelPermissionPredicateGroup,
    ) => boolean;
  }): Set<string> => {
    const isExportedByUniversalIdentifier = new Map<string, boolean>();

    for (const flatRowLevelPermissionPredicateGroup of Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      const unresolvedGroups: UniversalFlatRowLevelPermissionPredicateGroup[] =
        [];
      const unresolvedUniversalIdentifiers = new Set<string>();
      let currentGroup: UniversalFlatRowLevelPermissionPredicateGroup =
        flatRowLevelPermissionPredicateGroup;
      let isAncestryExported = true;

      while (true) {
        const knownExportability = isExportedByUniversalIdentifier.get(
          currentGroup.universalIdentifier,
        );

        if (isDefined(knownExportability)) {
          isAncestryExported = knownExportability;
          break;
        }

        if (
          unresolvedUniversalIdentifiers.has(currentGroup.universalIdentifier)
        ) {
          isAncestryExported = false;
          break;
        }

        unresolvedGroups.push(currentGroup);
        unresolvedUniversalIdentifiers.add(currentGroup.universalIdentifier);

        const parentUniversalIdentifier =
          currentGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier;

        if (!isDefined(parentUniversalIdentifier)) {
          break;
        }

        const parentGroup =
          flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier[
            parentUniversalIdentifier
          ];

        if (
          !isDefined(parentGroup) ||
          !isSameRowLevelPermissionScope(currentGroup, parentGroup)
        ) {
          isAncestryExported = false;
          break;
        }

        currentGroup = parentGroup;
      }

      for (const unresolvedGroup of unresolvedGroups.reverse()) {
        isAncestryExported =
          isAncestryExported && isExportableOnItsOwn(unresolvedGroup);
        isExportedByUniversalIdentifier.set(
          unresolvedGroup.universalIdentifier,
          isAncestryExported,
        );
      }
    }

    return new Set(
      [...isExportedByUniversalIdentifier]
        .filter(([, isExported]) => isExported)
        .map(([universalIdentifier]) => universalIdentifier),
    );
  };
