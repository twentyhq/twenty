import { capitalize } from '~/utils/string/capitalize';

export const getObjectTypename = (objectNameSingular: string) => {
  return capitalize(objectNameSingular);
};
