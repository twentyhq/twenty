import { type CommandMenuItemConfig } from '@/sdk/define/command-menu-items/command-menu-item-config';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

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
