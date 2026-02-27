import { isNumber, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { KNOWN_CONSTANTS } from '../resolve-constants';

const isResolvedPrimitive = (value: unknown): value is string | number =>
  isString(value) || isNumber(value);

export const tryResolveKnownConstant = ({
  constantPath,
}: {
  constantPath: string;
}): string | number | undefined => {
  if (constantPath in KNOWN_CONSTANTS) {
    const constantValue = KNOWN_CONSTANTS[constantPath];

    return isResolvedPrimitive(constantValue) ? constantValue : undefined;
  }

  const pathSegments = constantPath.split('.');

  if (pathSegments.length !== 2) {
    return undefined;
  }

  const [objectName, propertyName] = pathSegments;

  if (!(objectName in KNOWN_CONSTANTS)) {
    return undefined;
  }

  const constantObject = KNOWN_CONSTANTS[objectName];

  if (!isPlainObject(constantObject) || !(propertyName in constantObject)) {
    return undefined;
  }

  const propertyValue = constantObject[propertyName];

  return isResolvedPrimitive(propertyValue) ? propertyValue : undefined;
};
