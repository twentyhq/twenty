import { type CommandMenuItemConfig } from '@/sdk/define/command-menu-items/command-menu-item-config';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

// Defines a command menu item as a top-level entity. Use this when you want a
// command that points at an existing front component without re-declaring the
// component, or when you want to declare commands in a separate file from the
// component definition. For commands that always travel with their component,
// use the `command:` field on `defineFrontComponent` instead — never both for
// the same component, the manifest aggregator will reject duplicate identifiers.
export const defineCommandMenuItem: DefineEntity<CommandMenuItemConfig> = (
  config,
) => {
  const errors: string[] = [];

  if (!config.universalIdentifier) {
    errors.push('CommandMenuItem must have a universalIdentifier');
  }

  if (!config.label) {
    errors.push('CommandMenuItem must have a label');
  }

  if (!config.frontComponentUniversalIdentifier) {
    errors.push(
      'CommandMenuItem must have a frontComponentUniversalIdentifier (the universalIdentifier of the front component this command opens)',
    );
  }

  return createValidationResult({ config, errors });
};
