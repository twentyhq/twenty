import { capitalize } from '~/utils/string/capitalize';

export const getDestroyOneRecordMutationResponseField = (
  objectNameSingular: string,
) => `destroy${capitalize(objectNameSingular)}`;
