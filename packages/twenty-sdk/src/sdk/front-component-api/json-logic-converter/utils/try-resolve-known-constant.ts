import { isNumber, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { ALLOWED_CONSTANTS_IN_SHOULD_BE_REGISTERED } from '../constants/allowed-constants-in-should-be-registered';

const isResolvedPrimitive = (value: unknown): value is string | number =>
  isString(value) || isNumber(value);

export const tryResolveKnownConstant = ({
  constantPath,
}: {
  constantPath: string;
}): string | number | undefined => {
  if (constantPath in ALLOWED_CONSTANTS_IN_SHOULD_BE_REGISTERED) {
    const constantValue =
      ALLOWED_CONSTANTS_IN_SHOULD_BE_REGISTERED[constantPath];

    return isResolvedPrimitive(constantValue) ? constantValue : undefined;
  }

  const pathSegments = constantPath.split('.');

  if (pathSegments.length !== 2) {
    return undefined;
  }

  const [objectName, propertyName] = pathSegments;

  if (!(objectName in ALLOWED_CONSTANTS_IN_SHOULD_BE_REGISTERED)) {
    return undefined;
  }

  const constantObject = ALLOWED_CONSTANTS_IN_SHOULD_BE_REGISTERED[objectName];

  if (!isPlainObject(constantObject) || !(propertyName in constantObject)) {
    return undefined;
  }

  const propertyValue = constantObject[propertyName];

  return isResolvedPrimitive(propertyValue) ? propertyValue : undefined;
};
