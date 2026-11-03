import {
  isNonEmptyArray,
  isPlainObject,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';

export const hasSpecificWorkspaceMemberSelection = (
  recordFilters: unknown[],
): boolean =>
  recordFilters.some((recordFilter) => {
    if (
      !isPlainObject(recordFilter) ||
      recordFilter.contextKey !== 'currentWorkspaceMemberId'
    ) {
      return false;
    }

    const parsedValue = jsonRelationFilterValueSchema.safeParse(
      recordFilter.value,
    );

    return (
      !parsedValue.success ||
      isNonEmptyArray(parsedValue.data.selectedRecordIds)
    );
  });
