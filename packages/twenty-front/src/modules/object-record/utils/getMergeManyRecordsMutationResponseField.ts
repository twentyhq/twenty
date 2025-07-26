import { capitalize } from 'twenty-shared/utils';

export const getMergeManyRecordsMutationResponseField = (
  objectNamePlural: string,
): string => {
  return `merge${capitalize(objectNamePlural)}`;
};
