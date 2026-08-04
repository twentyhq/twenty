import {
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { parseConfigDuration } from 'src/engine/core-modules/twenty-config/utils/parse-config-duration.util';

@ValidatorConstraint()
export class PositiveDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: unknown, args: ValidationArguments) {
    const [isZeroAllowed] = args.constraints as [boolean];
    const parsedDuration = parseConfigDuration(duration);

    if (parsedDuration === undefined) {
      return false;
    }

    return isZeroAllowed ? parsedDuration >= 0 : parsedDuration > 0;
  }

  defaultMessage(args: ValidationArguments) {
    const [isZeroAllowed] = args.constraints as [boolean];

    return isZeroAllowed
      ? '$property must be a duration ms can parse into zero or more milliseconds, e.g. 10m or 0s'
      : '$property must be a duration ms can parse into a positive number of milliseconds, e.g. 30d, 12h or 10m';
  }
}
