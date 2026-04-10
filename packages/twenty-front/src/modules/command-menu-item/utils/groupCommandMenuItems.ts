import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const groupCommandMenuItems = (
  items: CommandMenuItemFieldsFragment[],
) => {
  const pinned: CommandMenuItemFieldsFragment[] = [];
  const other: CommandMenuItemFieldsFragment[] = [];

  for (const item of items) {
    if (item.isPinned) {
      pinned.push(item);
    } else {
      other.push(item);
    }
  }

  return { pinned, other };
};
