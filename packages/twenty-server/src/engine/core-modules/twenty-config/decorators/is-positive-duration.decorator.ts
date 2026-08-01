import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { parseConfigDuration } from 'src/engine/core-modules/twenty-config/utils/parse-config-duration.util';

// A negative lifetime would yield credentials that expire before they are
// issued, and IsDuration accepts one.
@ValidatorConstraint()
export class IsPositiveDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: unknown) {
    const parsedDuration = parseConfigDuration(duration);

    return parsedDuration !== undefined && parsedDuration > 0;
  }

  defaultMessage() {
    return '$property must be a positive duration ms can parse, e.g. 30d, 12h or 10m';
  }
}

export const IsPositiveDuration =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPositiveDurationConstraint,
    });
  };
