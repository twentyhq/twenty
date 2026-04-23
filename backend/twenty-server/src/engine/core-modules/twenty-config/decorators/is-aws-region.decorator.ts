import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsAWSRegionConstraint implements ValidatorConstraintInterface {
  validate(region: string) {
    const regex = /^[a-z]{2}-[a-z]+-\d{1}$/;

    return regex.test(region); // Returns true if region matches regex
  }
}

export const IsAWSRegion =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAWSRegionConstraint,
    });
  };
