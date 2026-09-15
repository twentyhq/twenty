export type RowLevelPermissionPredicateGroupRow = {
  id: string;
  objectMetadataId: string;
  parentRowLevelPermissionPredicateGroupId?: string | null;
};

export const findParentlessOpportunityRlsGroups = (
  groups: readonly RowLevelPermissionPredicateGroupRow[],
  opportunityObjectId: string,
): RowLevelPermissionPredicateGroupRow[] =>
  groups.filter(
    (group) =>
      group.objectMetadataId === opportunityObjectId &&
      !group.parentRowLevelPermissionPredicateGroupId,
  );
