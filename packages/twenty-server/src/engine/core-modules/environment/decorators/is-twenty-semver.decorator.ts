import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import semver from 'semver';

@ValidatorConstraint({ async: false })
export class IsTwentySemVerValidator implements ValidatorConstraintInterface {
  validate(version: any) {
    try {
      const parsed = semver.parse(version);
      return parsed !== null;
    } catch(e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid semantic version (e.g., 1.0.0)`;
  }
}

export const IsTwentySemVer =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTwentySemVerValidator,
    });
  };
