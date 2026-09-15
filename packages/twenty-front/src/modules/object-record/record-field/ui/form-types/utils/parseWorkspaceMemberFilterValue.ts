import {
  arrayOfUuidOrVariableSchema,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';

export type ParsedWorkspaceMemberFilterValue = {
  isCurrentWorkspaceMemberSelected: boolean;
  selectedRecordIds: string[];
};

export const parseWorkspaceMemberFilterValue = (
  rawValue: string | null | undefined,
): ParsedWorkspaceMemberFilterValue => {
  if (!isDefined(rawValue) || rawValue === '') {
    return {
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: [],
    };
  }

  const fallbackRecordIds = (() => {
    try {
      return arrayOfUuidOrVariableSchema.parse(rawValue);
    } catch {
      return [] as string[];
    }
  })();

  const parsed = jsonRelationFilterValueSchema
    .catch({
      isCurrentWorkspaceMemberSelected: false,
      selectedRecordIds: fallbackRecordIds,
    })
    .parse(rawValue);

  return {
    isCurrentWorkspaceMemberSelected:
      parsed.isCurrentWorkspaceMemberSelected ?? false,
    selectedRecordIds: parsed.selectedRecordIds,
  };
};

export const buildWorkspaceMemberFilterJsonValue = ({
  isCurrentWorkspaceMemberSelected,
  selectedRecordIds,
}: ParsedWorkspaceMemberFilterValue): string => {
  if (!isCurrentWorkspaceMemberSelected && selectedRecordIds.length === 0) {
    return '';
  }

  return JSON.stringify({
    isCurrentWorkspaceMemberSelected,
    selectedRecordIds,
  });
};
