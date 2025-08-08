import {
  IsOptional,
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';

import { type ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { type ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { type ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { applyBasicValidators } from 'src/engine/core-modules/twenty-config/utils/apply-basic-validators.util';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface ConfigVariablesMetadataOptions {
  group: ConfigVariablesGroup;
  description: string;
  isSensitive?: boolean;
  isEnvOnly?: boolean;
  type: ConfigVariableType;
  options?: ConfigVariableOptions;
}

export type ConfigVariablesMetadataMap = {
  [key: string]: ConfigVariablesMetadataOptions;
};

export function ConfigVariablesMetadata(
  options: ConfigVariablesMetadataOptions,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingMetadata: ConfigVariablesMetadataMap =
      TypedReflect.getMetadata('config-variables', target.constructor) ?? {};

    TypedReflect.defineMetadata(
      'config-variables',
      {
        ...existingMetadata,
        [propertyKey.toString()]: options,
      },
      target.constructor,
    );

    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      target.constructor.prototype,
      propertyKey,
    );
    const hasDefaultValue =
      propertyDescriptor && propertyDescriptor.value !== undefined;

    if (!hasDefaultValue) {
      IsOptional()(target, propertyKey);
    }

    applyBasicValidators(
      options.type,
      target,
      propertyKey.toString(),
      options.options,
    );

    registerDecorator({
      name: propertyKey.toString(),
      target: target.constructor,
      propertyName: propertyKey.toString(),
      options: validationOptions,
      constraints: [options],
      validator: {
        validate() {
          return true;
        },
        defaultMessage() {
          return `${propertyKey.toString()} has invalid metadata`;
        },
      },
    });
  };
}
