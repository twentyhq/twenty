import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
} from '~/generated-metadata/graphql';

export type RowLevelPermissionRuleGrant = {
  rootPredicateGroupId: string;
  canCreateRecords: boolean;
  canReadRecords: boolean;
  canUpdateRecords: boolean;
  canSoftDeleteRecords: boolean;
  canDestroyRecords: boolean;
};

export type RowLevelPermissionRulesToSave = {
  objectMetadataId: string;
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
  ruleGrants: RowLevelPermissionRuleGrant[];
};

const getRootPredicateGroupId = ({
  predicateGroupId,
  predicateGroupById,
}: {
  predicateGroupId: string;
  predicateGroupById: Map<string, RowLevelPermissionPredicateGroup>;
}) => {
  const visitedPredicateGroupIds = new Set<string>();
  let predicateGroup = predicateGroupById.get(predicateGroupId);

  while (
    isDefined(predicateGroup?.parentRowLevelPermissionPredicateGroupId) &&
    !visitedPredicateGroupIds.has(predicateGroup.id)
  ) {
    visitedPredicateGroupIds.add(predicateGroup.id);
    predicateGroup = predicateGroupById.get(
      predicateGroup.parentRowLevelPermissionPredicateGroupId,
    );
  }

  return predicateGroup?.id;
};

// A rule without any predicate would match every record, so its root group is not saved
export const getRowLevelPermissionRulesToSave = ({
  draftRole,
  persistedRole,
}: {
  draftRole: Pick<
    RoleWithPartialMembers,
    'rowLevelPermissionPredicates' | 'rowLevelPermissionPredicateGroups'
  >;
  persistedRole?: Pick<
    RoleWithPartialMembers,
    'rowLevelPermissionPredicates' | 'rowLevelPermissionPredicateGroups'
  >;
}): RowLevelPermissionRulesToSave[] => {
  const predicates = draftRole.rowLevelPermissionPredicates ?? [];
  const predicateGroups = draftRole.rowLevelPermissionPredicateGroups ?? [];
  const predicateGroupById = new Map(
    predicateGroups.map((predicateGroup) => [
      predicateGroup.id,
      predicateGroup,
    ]),
  );

  const rootPredicateGroupIdsWithPredicates = new Set(
    predicates
      .map((predicate) =>
        isDefined(predicate.rowLevelPermissionPredicateGroupId)
          ? getRootPredicateGroupId({
              predicateGroupId: predicate.rowLevelPermissionPredicateGroupId,
              predicateGroupById,
            })
          : undefined,
      )
      .filter(isDefined),
  );

  const savedPredicateGroups = predicateGroups.filter((predicateGroup) => {
    const rootPredicateGroupId = getRootPredicateGroupId({
      predicateGroupId: predicateGroup.id,
      predicateGroupById,
    });

    return (
      isDefined(rootPredicateGroupId) &&
      rootPredicateGroupIdsWithPredicates.has(rootPredicateGroupId)
    );
  });

  const objectMetadataIds = new Set([
    ...predicates.map(({ objectMetadataId }) => objectMetadataId),
    ...savedPredicateGroups.map(({ objectMetadataId }) => objectMetadataId),
    ...(persistedRole?.rowLevelPermissionPredicates ?? []).map(
      ({ objectMetadataId }) => objectMetadataId,
    ),
    ...(persistedRole?.rowLevelPermissionPredicateGroups ?? []).map(
      ({ objectMetadataId }) => objectMetadataId,
    ),
  ]);

  return [...objectMetadataIds].map((objectMetadataId) => {
    const objectPredicateGroups = savedPredicateGroups.filter(
      (predicateGroup) => predicateGroup.objectMetadataId === objectMetadataId,
    );

    return {
      objectMetadataId,
      predicates: predicates.filter(
        (predicate) => predicate.objectMetadataId === objectMetadataId,
      ),
      predicateGroups: objectPredicateGroups,
      ruleGrants: objectPredicateGroups
        .filter(
          (predicateGroup) =>
            !isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId),
        )
        .map((rootPredicateGroup) => ({
          rootPredicateGroupId: rootPredicateGroup.id,
          canCreateRecords: rootPredicateGroup.canUpdateRecords,
          canReadRecords: rootPredicateGroup.canReadRecords,
          canUpdateRecords: rootPredicateGroup.canUpdateRecords,
          canSoftDeleteRecords: rootPredicateGroup.canSoftDeleteRecords,
          canDestroyRecords: rootPredicateGroup.canDestroyRecords,
        })),
    };
  });
};
