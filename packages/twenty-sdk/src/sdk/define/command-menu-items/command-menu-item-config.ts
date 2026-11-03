import { type CommandMenuItemManifest } from 'twenty-shared/application';

export type CommandMenuItemConfig = Omit<
  CommandMenuItemManifest,
  'conditionalAvailability' | 'conditionalPinned' | 'conditionalDisplay'
> & {
  conditionalAvailabilityExpression?: boolean | string;
  conditionalPinnedExpression?: boolean | string;
};
