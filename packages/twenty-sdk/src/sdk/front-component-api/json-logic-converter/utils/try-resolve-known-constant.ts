import { isPlainObject } from 'twenty-shared/utils';

import { KNOWN_CONSTANTS } from '../resolve-constants';
import { type JsonLogicRule } from '../types/json-logic-rule';

export const tryResolveKnownConstant = (
  constantPath: string,
): JsonLogicRule | undefined => {
  if (constantPath in KNOWN_CONSTANTS) {
    return KNOWN_CONSTANTS[constantPath];
  }

  const pathSegments = constantPath.split('.');

  if (pathSegments.length === 2) {
    const [objectName, propertyName] = pathSegments;

    if (objectName in KNOWN_CONSTANTS) {
      const constantObject = KNOWN_CONSTANTS[objectName];

      if (isPlainObject(constantObject) && propertyName in constantObject) {
        return constantObject[propertyName] as JsonLogicRule;
      }
    }
  }

  return undefined;
};
