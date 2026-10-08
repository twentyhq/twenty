import { type CommandMenuPinnedInlineLayout } from '@/command-menu-item/display/types/CommandMenuPinnedInlineLayout';
import { type PinnedCommandMenuItemsLayoutKey } from '@/command-menu-item/display/types/PinnedCommandMenuItemsLayoutKey';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Keyed per surface: a header and a side panel footer can show the same items at once at different sizes.
export const commandMenuPinnedInlineLayoutFamilyState = createAtomFamilyState<
  CommandMenuPinnedInlineLayout,
  PinnedCommandMenuItemsLayoutKey
>({
  key: 'commandMenuPinnedInlineLayoutFamilyState',
  defaultValue: {
    containerWidth: 0,
    commandMenuItemWidthsByKey: {},
  },
});
