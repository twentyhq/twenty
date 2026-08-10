import { type PinnedCommandMenuItemsLayoutKey } from '@/command-menu-item/display/types/PinnedCommandMenuItemsLayoutKey';
import { type CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';

type PinnedCommandMenuItemsDisplayConfig = {
  layoutKey: PinnedCommandMenuItemsLayoutKey;
  // The footer is far narrower than a page header, so it labels a single action
  // and falls back to icons for the rest.
  shouldLabelSingleCommandMenuItem: boolean;
  // Items are ordered icons first, labels last. The header reverses that so
  // labels sit on the left of the icons; the footer keeps its label rightmost.
  shouldReverseCommandMenuItems: boolean;
};

export const getPinnedCommandMenuItemsDisplayConfig = (
  containerType: CommandMenuItemContainerType,
): PinnedCommandMenuItemsDisplayConfig =>
  containerType === 'side-panel-footer'
    ? {
        layoutKey: 'side-panel-footer',
        shouldLabelSingleCommandMenuItem: true,
        shouldReverseCommandMenuItems: false,
      }
    : {
        layoutKey: 'page-header',
        shouldLabelSingleCommandMenuItem: false,
        shouldReverseCommandMenuItems: true,
      };
