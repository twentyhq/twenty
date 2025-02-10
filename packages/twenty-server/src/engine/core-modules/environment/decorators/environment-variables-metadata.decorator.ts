import { registerDecorator, ValidationOptions } from 'class-validator';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface EnvironmentVariablesMetadataOptions {
  group: EnvironmentVariablesGroup;
  description: string;
  sensitive?: boolean;
}

export type EnvironmentVariablesMetadataMap = {
  [key: string]: EnvironmentVariablesMetadataOptions;
};

export function EnvironmentVariablesMetadata(
  options: EnvironmentVariablesMetadataOptions,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const existingMetadata: EnvironmentVariablesMetadataMap =
      TypedReflect.getMetadata('environment-variables', target.constructor) ??
      {};

    TypedReflect.defineMetadata(
      'environment-variables',
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
