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
    const flatRowLevelPermissionPredicateGroups: UniversalFlatRowLevelPermissionPredicateGroup[] =
      Object.values(
        flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
      ).filter(isDefined);
    const childGroupsByParentUniversalIdentifier = new Map<
      string,
      UniversalFlatRowLevelPermissionPredicateGroup[]
    >();

    for (const flatRowLevelPermissionPredicateGroup of flatRowLevelPermissionPredicateGroups) {
      const parentUniversalIdentifier =
        flatRowLevelPermissionPredicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier;

      if (isDefined(parentUniversalIdentifier)) {
        childGroupsByParentUniversalIdentifier.set(parentUniversalIdentifier, [
          ...(childGroupsByParentUniversalIdentifier.get(
            parentUniversalIdentifier,
          ) ?? []),
          flatRowLevelPermissionPredicateGroup,
        ]);
      }
    }

    const exportedGroups = flatRowLevelPermissionPredicateGroups.filter(
      (flatRowLevelPermissionPredicateGroup) =>
        !isDefined(
          flatRowLevelPermissionPredicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
        ) && isExportableOnItsOwn(flatRowLevelPermissionPredicateGroup),
    );

    for (const exportedGroup of exportedGroups) {
      const exportedChildGroups = (
        childGroupsByParentUniversalIdentifier.get(
          exportedGroup.universalIdentifier,
        ) ?? []
      ).filter(
        (childGroup) =>
          isSameRowLevelPermissionScope({
            scope: childGroup,
            otherScope: exportedGroup,
          }) && isExportableOnItsOwn(childGroup),
      );

      exportedGroups.push(...exportedChildGroups);
    }

    return new Set(
      exportedGroups.map(({ universalIdentifier }) => universalIdentifier),
    );
  };
