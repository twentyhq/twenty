import { IconCheckbox, IconComponent, IconNotes } from 'twenty-ui';

export const getIconForObjectType = (
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
