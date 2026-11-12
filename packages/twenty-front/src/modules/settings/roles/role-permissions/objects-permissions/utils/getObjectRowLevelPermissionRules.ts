import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from '~/generated-metadata/graphql';

export type ObjectRowLevelPermissionRule = {
  rootPredicateGroup: RowLevelPermissionPredicateGroup;
  predicates: RowLevelPermissionPredicate[];
};

export const getObjectRowLevelPermissionRules = ({
  role,
  objectMetadataId,
}: {
  role: Pick<
    RoleWithPartialMembers,
    'rowLevelPermissionPredicates' | 'rowLevelPermissionPredicateGroups'
  >;
  objectMetadataId: string;
}): ObjectRowLevelPermissionRule[] => {
  const predicateGroups = (role.rowLevelPermissionPredicateGroups ?? []).filter(
    (predicateGroup) => predicateGroup.objectMetadataId === objectMetadataId,
  );
  const parentIdByPredicateGroupId = new Map(
    predicateGroups.map((predicateGroup) => [
      predicateGroup.id,
      predicateGroup.parentRowLevelPermissionPredicateGroupId,
    ]),
  );

  const getRootPredicateGroupId = (predicateGroupId: string) => {
    let currentPredicateGroupId = predicateGroupId;

    for (let depth = 0; depth < predicateGroups.length; depth++) {
      const parentPredicateGroupId = parentIdByPredicateGroupId.get(
        currentPredicateGroupId,
      );

      if (!isDefined(parentPredicateGroupId)) {
        break;
      }

      currentPredicateGroupId = parentPredicateGroupId;
    }

    return currentPredicateGroupId;
  };

  const objectPredicates = (role.rowLevelPermissionPredicates ?? []).filter(
    (predicate) =>
      predicate.objectMetadataId === objectMetadataId &&
      isDefined(predicate.rowLevelPermissionPredicateGroupId),
  );

  return predicateGroups
    .filter(
      (predicateGroup) =>
        !isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId),
    )
    .map((rootPredicateGroup) => ({
      rootPredicateGroup,
      predicates: objectPredicates.filter(
        (predicate) =>
          isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
          getRootPredicateGroupId(
            predicate.rowLevelPermissionPredicateGroupId,
          ) === rootPredicateGroup.id,
      ),
    }));
};
