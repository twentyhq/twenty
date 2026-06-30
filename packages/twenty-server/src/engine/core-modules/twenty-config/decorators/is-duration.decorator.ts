import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: string) {
    const regex =
      /^-?[0-9]+(.[0-9]+)?(m(illiseconds?)?|s(econds?)?|h((ou)?rs?)?|d(ays?)?|w(eeks?)?|M(onths?)?|y(ears?)?)?$/;

    return regex.test(duration); // Returns true if duration matches regex
  }
}

export const IsDuration =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDurationConstraint,
    });
  };
