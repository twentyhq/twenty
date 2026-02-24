import { type ArrayLiteralExpression, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const resolveArrayLiteralElements = (
  arrayLiteral: ArrayLiteralExpression,
): JsonLogicRule[] =>
  arrayLiteral.getElements().map((element) => {
    if (Node.isStringLiteral(element)) {
      return element.getLiteralValue();
    }

    if (Node.isNumericLiteral(element)) {
      return element.getLiteralValue();
    }

    const resolvedConstantValue = tryResolveKnownConstant(element.getText());

    if (isDefined(resolvedConstantValue)) {
      return resolvedConstantValue;
    }

    throw new JsonLogicConversionError(
      'Cannot resolve array element',
      element.getText(),
      element.getKindName(),
    );
  });
