import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsAWSRegionConstraint implements ValidatorConstraintInterface {
  validate(region: string) {
    const regex = /^[a-z]{2,4}(?:-[a-z]+){1,2}-\d+$/;

    return regex.test(region);
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
