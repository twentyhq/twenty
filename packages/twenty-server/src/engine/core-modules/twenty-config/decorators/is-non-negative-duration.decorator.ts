import { registerDecorator, type ValidationOptions } from 'class-validator';

import { PositiveDurationConstraint } from 'src/engine/core-modules/twenty-config/validators/positive-duration.validator';

const IS_ZERO_ALLOWED = true;

export const IsNonNegativeDuration =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [IS_ZERO_ALLOWED],
      validator: PositiveDurationConstraint,
    });
  };
