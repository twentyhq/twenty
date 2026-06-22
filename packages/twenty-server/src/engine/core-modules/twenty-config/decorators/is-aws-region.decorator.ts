import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: true })
export class IsAWSRegionConstraint implements ValidatorConstraintInterface {
  validate(region: string, args?: ValidationArguments) {
    const object = args?.object as any;

    if (args?.property === 'STORAGE_S3_REGION' && object?.STORAGE_S3_ENDPOINT) {
      return typeof region === 'string' && region.length > 0;
    }

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
