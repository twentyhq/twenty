import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import ms from 'ms';

// Like IsPositiveDuration, but zero is a meaningful value: a window of zero
// deliberately turns the behaviour it gates off.
@ValidatorConstraint()
export class IsNonNegativeDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: unknown) {
    if (typeof duration !== 'string') {
      return false;
    }

    try {
      const parsedDuration = ms(duration as Parameters<typeof ms>[0]);

      return typeof parsedDuration === 'number' && parsedDuration >= 0;
    } catch {
      return false;
    }
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
