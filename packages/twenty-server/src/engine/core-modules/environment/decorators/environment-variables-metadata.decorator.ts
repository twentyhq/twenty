import { registerDecorator, ValidationOptions } from 'class-validator';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';

export interface EnvironmentVariablesMetadataOptions {
  group: EnvironmentVariablesGroup;
  subGroup?: EnvironmentVariablesSubGroup;
  description: string;
  sensitive?: boolean;
}

export const METADATA_KEY = 'environmentVariablesMetadata';

export const EnvironmentVariablesMetadata = (
  options: EnvironmentVariablesMetadataOptions,
  validationOptions?: ValidationOptions,
) => {
  return (target: object, propertyName: string) => {
    Reflect.defineMetadata(METADATA_KEY, options, target, propertyName);
    registerDecorator({
      name: 'environmentVariablesMetadata',
      target: target.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options],
      validator: {
        validate() {
          return true;
        },
        defaultMessage() {
          return `${propertyName} has invalid metadata`;
        },
      },
    });
  };
};
