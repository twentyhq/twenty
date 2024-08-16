import { capitalize } from '~/utils/string/capitalize';

export const getRestoreManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `restore${capitalize(objectNamePlural)}`;
