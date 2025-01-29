import { registerDecorator, ValidationOptions } from 'class-validator';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface EnvironmentVariablesMetadataOptions {
  group: EnvironmentVariablesGroup;
  subGroup?: EnvironmentVariablesSubGroup;
  description: string;
  sensitive?: boolean;
}
// not sure if this should be here or in the typed-reflect file
// right now its here because I dont want to change the typed-reflect file :)
declare module 'src/utils/typed-reflect' {
  interface ReflectMetadataTypeMap {
    ['workspace:environment-variables-metadata']: EnvironmentVariablesMetadataOptions;
    ['workspace:environment-variable-names']: string[];
  }
}

export const METADATA_KEY = 'workspace:environment-variables-metadata' as const;
export const ENV_VAR_NAMES_KEY =
  'workspace:environment-variable-names' as const;

export function EnvironmentVariablesMetadata(
  options: EnvironmentVariablesMetadataOptions,
  validationOptions?: ValidationOptions,
) {
  return (target: object, propertyKey?: string | symbol) => {
    if (propertyKey !== undefined) {
      TypedReflect.defineMetadata(
        METADATA_KEY,
        options,
        target,
        propertyKey.toString(),
      );

      const existingProps =
        TypedReflect.getMetadata(ENV_VAR_NAMES_KEY, target.constructor) ?? [];

      if (!existingProps.includes(propertyKey.toString())) {
        TypedReflect.defineMetadata(
          ENV_VAR_NAMES_KEY,
          [...existingProps, propertyKey.toString()],
          target.constructor,
        );
      }
    } else {
      TypedReflect.defineMetadata(METADATA_KEY, options, target);
    }

    if (propertyKey !== undefined) {
      registerDecorator({
        name: 'environmentVariablesMetadata',
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
    }
  };
}
