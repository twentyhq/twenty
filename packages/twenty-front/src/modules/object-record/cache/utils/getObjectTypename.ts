import { capitalize } from 'twenty-shared/utils';
export const getObjectTypename = (objectNameSingular: string) => {
  return capitalize(objectNameSingular);
};
