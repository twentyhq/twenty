import { type PinnedCommandMenuItemsLayoutKey } from '@/command-menu-item/display/types/PinnedCommandMenuItemsLayoutKey';
import { type CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';

type PinnedCommandMenuItemsDisplayConfig = {
  layoutKey: PinnedCommandMenuItemsLayoutKey;
  // The footer is far narrower than a page header, so it labels a single action
  // and falls back to icons for the rest.
  shouldLabelSingleCommandMenuItem: boolean;
};

export const getPinnedCommandMenuItemsDisplayConfig = (
  containerType: CommandMenuItemContainerType,
): PinnedCommandMenuItemsDisplayConfig =>
  containerType === 'side-panel-footer'
    ? { layoutKey: 'side-panel-footer', shouldLabelSingleCommandMenuItem: true }
    : { layoutKey: 'page-header', shouldLabelSingleCommandMenuItem: false };
