import { capitalize } from 'twenty-shared/utils';
export const getDeleteManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `delete${capitalize(objectNamePlural)}`;
