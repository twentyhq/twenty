import { registerDecorator, ValidationOptions } from 'class-validator';

import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface ConfigVariablesMetadataOptions {
  group: ConfigVariablesGroup;
  description: string;
  isSensitive?: boolean;
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
