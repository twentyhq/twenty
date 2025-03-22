import { capitalize } from 'twenty-shared/utils';
export const getDestroyManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `destroy${capitalize(objectNamePlural)}`;
