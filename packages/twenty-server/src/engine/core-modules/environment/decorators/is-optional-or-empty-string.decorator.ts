import { ValidateIf, ValidationOptions, isDefined } from 'class-validator';

export function IsOptionalOrEmptyString(validationOptions?: ValidationOptions) {
  return ValidateIf((_obj, value) => {
    return isDefined(value) && value !== '';
  }, validationOptions);
}
