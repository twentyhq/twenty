import { type CommandMenuPinnedInlineLayout } from '@/command-menu-item/display/types/CommandMenuPinnedInlineLayout';
import { type PinnedCommandMenuItemsLayoutKey } from '@/command-menu-item/display/types/PinnedCommandMenuItemsLayoutKey';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Surfaces measure the same items at different sizes and label policies, and a
// header can be on screen while a side panel footer is, so each keeps its own
// measurements.
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
