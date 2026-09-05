import { type CommandMenuContextApi } from 'twenty-shared/types';
import { evaluateConditionalAvailabilityExpression } from 'twenty-shared/utils';

import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

// Resolved once where availability is evaluated, so every consumer keeps
// reading isPinned as a plain boolean.
export const resolveCommandMenuItemPinning = (
  commandMenuItem: CommandMenuItemFieldsFragment,
  commandMenuContextApi: CommandMenuContextApi,
): CommandMenuItemFieldsFragment => ({
  ...commandMenuItem,
  isPinned:
    commandMenuItem.isPinned &&
    evaluateConditionalAvailabilityExpression(
      commandMenuItem.conditionalPinnedExpression,
      commandMenuContextApi,
    ),
});
