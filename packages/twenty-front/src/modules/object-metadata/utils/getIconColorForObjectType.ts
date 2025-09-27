import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type Theme } from '@emotion/react';

export const getIconColorForObjectType = ({
  objectType,
  theme,
}: {
  objectType: string;
  theme: Theme;
}): string => {
  switch (objectType) {
    case CoreObjectNameSingular.Note:
      return theme.color.yellow;
    case CoreObjectNameSingular.Task:
      return theme.color.blue;
    default:
      return 'currentColor';
  }
};
