import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const groupCommandMenuItems = <
  TCommandMenuItem extends Pick<CommandMenuItemFieldsFragment, 'isPinned'>,
>(
  items: TCommandMenuItem[],
) => {
  const pinned: TCommandMenuItem[] = [];
  const other: TCommandMenuItem[] = [];

  for (const item of items) {
    if (item.isPinned) {
      pinned.push(item);
    } else {
      other.push(item);
    }
  }

  return { pinned, other };
};
