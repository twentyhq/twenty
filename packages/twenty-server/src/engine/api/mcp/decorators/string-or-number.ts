import {
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'string-or-number', async: false })
export class IsNumberOrString implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return typeof value === 'number' || typeof value === 'string';
  }

  defaultMessage() {
    return '($value) must be number or string';
  }
}
