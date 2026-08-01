import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import ms from 'ms';

// Validated by the same parser the session code calls, so the accepted units
// cannot drift from it: IsDuration allows "1M" and "1Month", which ms reads
// as one minute and as nothing at all. It also allows a leading minus, which
// would yield credentials that expire before they are issued.
@ValidatorConstraint()
export class IsPositiveDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: unknown) {
    if (typeof duration !== 'string') {
      return false;
    }

    try {
      const parsedDuration = ms(duration as Parameters<typeof ms>[0]);

      return typeof parsedDuration === 'number' && parsedDuration > 0;
    } catch {
      return false;
    }
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
