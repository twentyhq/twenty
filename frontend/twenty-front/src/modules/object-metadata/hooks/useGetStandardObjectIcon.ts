import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { getIconForObjectType } from '@/object-metadata/utils/getIconForObjectType';

export const useGetStandardObjectIcon = (objectNameSingular: string) => {
  const Icon = getIconForObjectType(objectNameSingular);
  const IconColor = getIconColorForObjectType(objectNameSingular);

  return { Icon, IconColor };
};
