import { getRootPredicateGroupId } from '@/settings/roles/role/utils/getRootPredicateGroupId';
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
    | 'rowLevelPermissionPredicates'
    | 'rowLevelPermissionPredicateGroups'
    | 'rowLevelPermissionRules'
  >;
}): RowLevelPermissionRulesToSave[] => {
  const predicates = draftRole.rowLevelPermissionPredicates ?? [];
  const persistedRuleById = new Map(
    (persistedRole?.rowLevelPermissionRules ?? []).map((rule) => [
      rule.id,
      rule,
    ]),
  );

  const getCanCreateRecords = (
    rootPredicateGroup: RowLevelPermissionPredicateGroup,
  ) => {
    if (!isDefined(rootPredicateGroup.rowLevelPermissionRuleId)) {
      return rootPredicateGroup.canUpdateRecords;
    }

    return (
      persistedRuleById.get(rootPredicateGroup.rowLevelPermissionRuleId)
        ?.canCreateRecords ?? rootPredicateGroup.canUpdateRecords
    );
  };
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
          canCreateRecords: getCanCreateRecords(rootPredicateGroup),
          canReadRecords: rootPredicateGroup.canReadRecords,
          canUpdateRecords: rootPredicateGroup.canUpdateRecords,
          canSoftDeleteRecords: rootPredicateGroup.canSoftDeleteRecords,
          canDestroyRecords: rootPredicateGroup.canDestroyRecords,
        })),
    };
  });
};
