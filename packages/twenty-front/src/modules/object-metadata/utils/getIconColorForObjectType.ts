import { type ThemeType } from 'twenty-ui/theme';

export const getIconColorForObjectType = ({
  objectType,
  theme,
}: {
  objectType: string;
  theme: ThemeType;
}): string => {
  switch (objectType) {
    case 'note':
      return theme.color.yellow;
    case 'task':
      return theme.color.blue;
    default:
      return 'currentColor';
  }
};
