import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { capitalize } from 'twenty-shared/utils';

export const getConnectionTypename = (objectNameSingular: string) => {
  return `${capitalize(getObjectTypename(objectNameSingular))}Connection`;
};
