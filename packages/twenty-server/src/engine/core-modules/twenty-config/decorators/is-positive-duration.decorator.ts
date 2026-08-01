import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

// IsDuration accepts a leading minus, which is meaningless for a lifetime or
// a timeout: a negative one yields credentials that expire before they are
// issued. Zero is refused for the same reason.
const POSITIVE_DURATION_REGEX =
  /^[0-9]+(\.[0-9]+)?(m(illiseconds?)?|s(econds?)?|h((ou)?rs?)?|d(ays?)?|w(eeks?)?|M(onths?)?|y(ears?)?)?$/;

@ValidatorConstraint()
export class IsPositiveDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: string) {
    return POSITIVE_DURATION_REGEX.test(duration) && parseFloat(duration) > 0;
  }

  defaultMessage() {
    return '$property must be a positive duration, e.g. 30d, 12h or 10m';
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
