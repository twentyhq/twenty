import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { parseConfigDuration } from 'src/engine/core-modules/twenty-config/utils/parse-config-duration.util';

// Like IsPositiveDuration, but zero is a meaningful value: a window of zero
// deliberately turns the behaviour it gates off.
@ValidatorConstraint()
export class IsNonNegativeDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: unknown) {
    const parsedDuration = parseConfigDuration(duration);

    return parsedDuration !== undefined && parsedDuration >= 0;
  }

  defaultMessage() {
    return '$property must be a duration ms can parse and cannot be negative, e.g. 10m or 0s';
  }
}

export const IsNonNegativeDuration =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNonNegativeDurationConstraint,
    });
  };
