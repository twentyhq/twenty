import { type CommandMenuPinnedInlineLayout } from '@/command-menu-item/display/types/CommandMenuPinnedInlineLayout';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuPinnedInlineLayoutState =
  createAtomState<CommandMenuPinnedInlineLayout>({
    key: 'commandMenuPinnedInlineLayoutState',
    defaultValue: {
      containerWidth: 0,
      commandMenuItemWidthsByKey: {},
    },
  });
