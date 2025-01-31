import { registerDecorator, ValidationOptions } from 'class-validator';

import { ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY } from 'src/engine/core-modules/environment/constants/environment-variables-metadata-decorator-key';
import { ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY } from 'src/engine/core-modules/environment/constants/environment-variables-metadata-decorator-names-key';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface EnvironmentVariablesMetadataOptions {
  group: EnvironmentVariablesGroup;
  subGroup?: EnvironmentVariablesSubGroup;
  description: string;
  sensitive?: boolean;
}

export function EnvironmentVariablesMetadata(
  options: EnvironmentVariablesMetadataOptions,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    TypedReflect.defineMetadata(
      ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY,
      options,
      target,
      propertyKey.toString(),
    );

    const existingVars =
      TypedReflect.getMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
        target.constructor,
      ) ?? [];

    if (!existingVars.includes(propertyKey.toString())) {
      TypedReflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
        [...existingVars, propertyKey.toString()],
        target.constructor,
      );
    }

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
