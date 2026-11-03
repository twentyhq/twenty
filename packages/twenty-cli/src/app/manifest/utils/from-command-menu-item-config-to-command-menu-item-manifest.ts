import { type CommandMenuItemConfig } from '@/app/manifest/types/command-menu-item-config.type';
import { compileCommandMenuItemConditionExpression } from '@/app/manifest/utils/compile-command-menu-item-condition-expression';
import { type CommandMenuItemManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const fromCommandMenuItemConfigToCommandMenuItemManifest = ({
  commandMenuItemConfig,
  sourcePath,
}: {
  commandMenuItemConfig: CommandMenuItemConfig;
  sourcePath: string;
}): {
  commandMenuItemManifest: CommandMenuItemManifest;
  errors: string[];
  warnings: string[];
} => {
  const {
    conditionalAvailabilityExpression,
    conditionalPinnedExpression,
    ...commandMenuItemProperties
  } = commandMenuItemConfig;

  const commandMenuItemManifest: CommandMenuItemManifest =
    commandMenuItemProperties;

  const conditionalAvailability = compileCommandMenuItemConditionExpression({
    expression: conditionalAvailabilityExpression,
    expressionDescription: `${sourcePath}: conditionalAvailabilityExpression of command menu item "${commandMenuItemConfig.label}"`,
    manifestKey: 'conditionalAvailability',
  });

  const conditionalPinned = compileCommandMenuItemConditionExpression({
    expression: conditionalPinnedExpression,
    expressionDescription: `${sourcePath}: conditionalPinnedExpression of command menu item "${commandMenuItemConfig.label}"`,
    manifestKey: 'conditionalPinned',
  });

  if (isDefined(conditionalAvailability.conditionalDisplay)) {
    commandMenuItemManifest.conditionalAvailability =
      conditionalAvailability.conditionalDisplay;
  }

  if (isDefined(conditionalPinned.conditionalDisplay)) {
    commandMenuItemManifest.conditionalPinned =
      conditionalPinned.conditionalDisplay;
  }

  return {
    commandMenuItemManifest,
    errors: [...conditionalAvailability.errors, ...conditionalPinned.errors],
    warnings: [
      ...conditionalAvailability.warnings,
      ...conditionalPinned.warnings,
    ],
  };
};
