import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { isLambdaResourceTags } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/is-lambda-resource-tags.util';

@ValidatorConstraint({ async: false })
export class IsLambdaResourceTagsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return isLambdaResourceTags(value);
  }

  defaultMessage() {
    return 'Lambda resource tags must be a JSON object with at most 48 string values, valid AWS tag characters, keys of 1–128 characters and values of at most 256 characters; aws: prefixes and Twenty checksum keys are reserved';
  }
}

export const IsLambdaResourceTags =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLambdaResourceTagsConstraint,
    });
  };
