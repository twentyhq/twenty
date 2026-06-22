import { isNonEmptyString } from '@sniptt/guards';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

const AWS_REGION_REGEX = /^[a-z]{2}-[a-z]+-\d{1}$/;

@ValidatorConstraint({ async: true })
export class IsRegionConstraint implements ValidatorConstraintInterface {
  validate(region: string, args?: ValidationArguments) {
    const [relaxIfPropertyPresent] = args?.constraints ?? [];

    if (isNonEmptyString(relaxIfPropertyPresent)) {
      const relaxingValue = (args?.object as Record<string, unknown>)[
        relaxIfPropertyPresent
      ];

      if (isNonEmptyString(relaxingValue)) {
        return typeof region === 'string' && region.trim().length > 0;
      }
    }

    return AWS_REGION_REGEX.test(region);
  }
}

export const IsRegion =
  (relaxIfPropertyPresent?: string, validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: isNonEmptyString(relaxIfPropertyPresent)
        ? [relaxIfPropertyPresent]
        : [],
      validator: IsRegionConstraint,
    });
  };
