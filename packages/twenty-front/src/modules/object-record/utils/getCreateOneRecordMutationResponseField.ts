import { capitalize } from 'twenty-shared/utils';
export const getCreateOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `create${capitalize(objectNameSingular)}`;
