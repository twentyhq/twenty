import { isNonEmptyString } from '@sniptt/guards';
import { ValidateIf, type ValidationOptions, isDefined } from 'class-validator';

export function IsOptionalOrEmptyString(validationOptions?: ValidationOptions) {
  return ValidateIf((_obj, value) => {
    return isDefined(value) && isNonEmptyString(value);
  }, validationOptions);
}
