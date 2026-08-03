import { registerDecorator, type ValidationOptions } from 'class-validator';

import { MinimumDurationConstraint } from 'src/engine/core-modules/twenty-config/validators/minimum-duration.validator';

export const IsPositiveDuration =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [1],
      validator: MinimumDurationConstraint,
    });
  };
