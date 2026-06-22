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
export class IsAWSRegionConstraint implements ValidatorConstraintInterface {
  validate(region: string, args?: ValidationArguments) {
    const [relaxIfPropertyPresent] = args?.constraints ?? [];

    // S3-compatible providers (Scaleway "fr-par", DigitalOcean) sign requests
    // with non-AWS region slugs. When the related property is set (a custom S3
    // endpoint), the value is just a signing label, so any non-blank string is
    // accepted instead of an AWS-shaped region.
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

export const IsAWSRegion =
  (relaxIfPropertyPresent?: string, validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: isNonEmptyString(relaxIfPropertyPresent)
        ? [relaxIfPropertyPresent]
        : [],
      validator: IsAWSRegionConstraint,
    });
  };
