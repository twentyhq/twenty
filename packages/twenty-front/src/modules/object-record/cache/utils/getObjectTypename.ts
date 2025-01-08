import { capitalize } from 'twenty-shared';

export const getObjectTypename = (objectNameSingular: string) => {
  return capitalize(objectNameSingular);
};
