import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const LEGACY_ASK_AI_SHORT_LABEL = 'Ask AI';
const LEGACY_ASK_AI_ICON = 'IconSparkles';

export const buildPinAskAiCommandMenuItemUpdate = ({
  existingCommandMenuItem,
  now,
}: {
  existingCommandMenuItem: FlatCommandMenuItem | undefined;
  now: string;
}): FlatCommandMenuItem | undefined => {
  if (!isDefined(existingCommandMenuItem)) {
    return undefined;
  }

  // These properties are workspace-editable, so an override means the
  // workspace already made its own choice for this command.
  const hasWorkspaceOverride =
    isDefined(existingCommandMenuItem.overrides?.isPinned) ||
    isDefined(existingCommandMenuItem.overrides?.shortLabel) ||
    isDefined(existingCommandMenuItem.overrides?.icon);

  if (
    hasWorkspaceOverride ||
    existingCommandMenuItem.isPinned !== false ||
    existingCommandMenuItem.shortLabel !== LEGACY_ASK_AI_SHORT_LABEL ||
    existingCommandMenuItem.icon !== LEGACY_ASK_AI_ICON
  ) {
    return undefined;
  }

  return {
    ...existingCommandMenuItem,
    isPinned: STANDARD_COMMAND_MENU_ITEMS.askAi.isPinned,
    shortLabel: STANDARD_COMMAND_MENU_ITEMS.askAi.shortLabel,
    icon: STANDARD_COMMAND_MENU_ITEMS.askAi.icon,
    updatedAt: now,
  };
};
