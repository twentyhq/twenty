import { registerDecorator, ValidationOptions } from 'class-validator';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';

export interface EnvironmentVariablesMetadataOptions {
  group: EnvironmentVariablesGroup;
  subGroup?: EnvironmentVariablesSubGroup;
  description: string;
  sensitive?: boolean;
  isShared?: boolean;
}

export const EnvironmentVariablesMetadata = (
  options: EnvironmentVariablesMetadataOptions,
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'environmentVariablesMetadata',
      target: object.constructor,
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
