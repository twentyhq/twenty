import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { capitalize } from '~/utils/string/capitalize';

export const getConnectionTypename = (objectNameSingular: string) => {
  return `${capitalize(getObjectTypename(objectNameSingular))}Connection`;
};
