import { type CommandMenuItemConfig } from '@/sdk/define/command-menu-items/command-menu-item-config';
import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';

export const defineCommandMenuItem: DefineEntity<CommandMenuItemConfig> = (
  config,
) => {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  const isRecordFieldCommandMenuItem =
    config.availabilityType === 'RECORD_FIELD';

  if (isRecordFieldCommandMenuItem) {
    if (!config.availabilityObjectUniversalIdentifier) {
      errors.push(
        'CommandMenuItem with availabilityType RECORD_FIELD must have an availabilityObjectUniversalIdentifier',
      );
    }

    if (!config.availabilityFieldUniversalIdentifier) {
      errors.push(
        'CommandMenuItem with availabilityType RECORD_FIELD must have an availabilityFieldUniversalIdentifier (the universalIdentifier of the field the button is rendered next to)',
      );
    }
  } else if (config.availabilityFieldUniversalIdentifier) {
    errors.push(
      'CommandMenuItem availabilityFieldUniversalIdentifier requires availabilityType RECORD_FIELD',
    );
  }

  // A field button has no label next to it, so its icon is the only thing
  // that tells it apart from the field's own copy and edit buttons.
  if (config.icon && !isRecordFieldCommandMenuItem) {
    warnings.push(
      'CommandMenuItem icon will be ignored in favor of application icon, you should remove it',
    );
  }

  return createValidationResult({ config, errors, warnings });
};
