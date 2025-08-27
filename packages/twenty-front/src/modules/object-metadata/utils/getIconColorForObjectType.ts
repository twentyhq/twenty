import { type Theme } from '@emotion/react';

export const getIconColorForObjectType = ({
  objectType,
  theme,
}: {
  objectType: string;
  theme: Theme;
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
