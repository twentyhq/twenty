import { type CommandMenuContextApi } from 'twenty-shared/types';
import { evaluateConditionalVariantExpression } from 'twenty-shared/utils';

import {
  type CommandMenuItemFieldsFragment,
  type CommandMenuItemVariant,
} from '~/generated-metadata/graphql';

type VariantCommandMenuItem = Pick<
  CommandMenuItemFieldsFragment,
  'variant' | 'conditionalVariantExpression'
>;

// Resolved once where availability is evaluated, so every consumer keeps
// reading variant as a plain value.
export const resolveCommandMenuItemVariant = <
  TCommandMenuItem extends VariantCommandMenuItem,
>(
  commandMenuItem: TCommandMenuItem,
  commandMenuContextApi: CommandMenuContextApi,
): TCommandMenuItem => ({
  ...commandMenuItem,
  variant: evaluateConditionalVariantExpression({
    expression: commandMenuItem.conditionalVariantExpression,
    context: commandMenuContextApi,
    fallbackVariant: commandMenuItem.variant,
  }) as CommandMenuItemVariant,
});
