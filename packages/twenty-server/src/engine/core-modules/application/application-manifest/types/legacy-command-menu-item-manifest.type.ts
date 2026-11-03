import { type CommandMenuItemManifest } from 'twenty-shared/application';

export type LegacyCommandMenuItemManifest = CommandMenuItemManifest & {
  conditionalAvailabilityExpression?: string;
  conditionalPinnedExpression?: string;
};
