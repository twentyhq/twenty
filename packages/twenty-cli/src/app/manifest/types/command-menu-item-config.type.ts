import { type CompiledConditionExpression } from '@/app/source/types/compiled-condition-expression.type';
import { type CommandMenuItemManifest } from 'twenty-shared/application';

export type CommandMenuItemConfig = Omit<
  CommandMenuItemManifest,
  'conditionalAvailability' | 'conditionalPinned' | 'conditionalDisplay'
> & {
  conditionalAvailabilityExpression?: string | CompiledConditionExpression;
  conditionalPinnedExpression?: string | CompiledConditionExpression;
};
