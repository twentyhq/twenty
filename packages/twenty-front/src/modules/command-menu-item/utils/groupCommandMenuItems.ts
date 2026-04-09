import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

const compareByPosition = (
  firstItem: CommandMenuItemFieldsFragment,
  secondItem: CommandMenuItemFieldsFragment,
) => firstItem.position - secondItem.position;

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

  pinned.sort(compareByPosition);
  other.sort(compareByPosition);

  return { pinned, other };
};
