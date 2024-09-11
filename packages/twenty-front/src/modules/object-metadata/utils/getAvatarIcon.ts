import { useTheme } from '@emotion/react';
import { IconCheckbox, IconComponent, IconNotes } from 'twenty-ui';

export const GetAvatarIcon = (objectNameSingular: string) => {
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
        return theme.color.yellowIcon;
      case 'task':
        return theme.color.blueIcon;
      default:
        return 'currentColor';
    }
  };

  const icon = getIconForObjectType(objectNameSingular);
  const iconColor = getIconColorForObjectType(objectNameSingular);

  return { icon, iconColor };
};
