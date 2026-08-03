import {
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { parseConfigDuration } from 'src/engine/core-modules/twenty-config/utils/parse-config-duration.util';

@ValidatorConstraint()
export class MinimumDurationConstraint implements ValidatorConstraintInterface {
  validate(duration: unknown, args: ValidationArguments) {
    const [minimumMs] = args.constraints as [number];
    const parsedDuration = parseConfigDuration(duration);

    return parsedDuration !== undefined && parsedDuration >= minimumMs;
  }

  defaultMessage(args: ValidationArguments) {
    const [minimumMs] = args.constraints as [number];

    return minimumMs > 0
      ? '$property must be a positive duration ms can parse, e.g. 30d, 12h or 10m'
      : '$property must be a duration ms can parse and cannot be negative, e.g. 10m or 0s';
  }
}
