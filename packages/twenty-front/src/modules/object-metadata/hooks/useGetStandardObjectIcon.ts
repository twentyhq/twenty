import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { getIconForObjectType } from '@/object-metadata/utils/getIconForObjectType';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

export const useGetStandardObjectIcon = (objectNameSingular: string) => {
  const { theme } = useContext(ThemeContext);

  const { Icon, IconColor } = {
    Icon: getIconForObjectType(objectNameSingular),
    IconColor: getIconColorForObjectType({
      objectType: objectNameSingular,
      theme,
    }),
  };

  return { Icon, IconColor };
};
