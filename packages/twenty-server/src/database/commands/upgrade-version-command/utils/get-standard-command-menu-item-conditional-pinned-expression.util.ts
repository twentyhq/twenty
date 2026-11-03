import { STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/utils/standard-command-menu-item-conditional-expressions.constant';

export const getStandardCommandMenuItemConditionalPinnedExpression = (
  universalIdentifier: string,
): string | null =>
  STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS[universalIdentifier]
    ?.conditionalPinnedExpression ?? null;
