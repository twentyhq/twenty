import { capitalize } from 'twenty-shared';

export const getDestroyManyRecordsMutationResponseField = (
  objectNamePlural: string,
) => `destroy${capitalize(objectNamePlural)}`;
