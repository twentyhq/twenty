import { useTheme } from '@emotion/react';
import { IconCheckbox, IconComponent, IconNotes } from 'twenty-ui';

export const useGetStandardObjectIcon = (objectNameSingular: string) => {
  const theme = useTheme();

  const getIconForObjectType = (
    objectType: string,
  ): IconComponent | undefined => {
    switch (objectType) {
      case 'note':
        return IconNotes;
      case 'task':
        return IconCheckbox;
      default:
        return undefined;
    }
  };

  const getIconColorForObjectType = (objectType: string): string => {
    switch (objectType) {
      case 'note':
        return theme.color.yellow;
      case 'task':
        return theme.color.blue;
      default:
        return 'currentColor';
    }
  };

  const { Icon, IconColor } = {
    Icon: getIconForObjectType(objectNameSingular),
    IconColor: getIconColorForObjectType(objectNameSingular),
  };

  return { Icon, IconColor };
};
