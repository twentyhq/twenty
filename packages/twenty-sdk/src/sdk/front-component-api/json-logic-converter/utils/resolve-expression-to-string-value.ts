import { isString } from '@sniptt/guards';
import { type Expression, Node } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';

import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const resolveExpressionToStringValue = (
  argumentExpression: Expression,
): string => {
  if (Node.isStringLiteral(argumentExpression)) {
    return argumentExpression.getLiteralValue();
  }

  const argumentText = argumentExpression.getText();
  const resolvedConstant = tryResolveKnownConstant(argumentText);

  if (isString(resolvedConstant)) {
    return resolvedConstant;
  }

  throw new JsonLogicConversionError(
    'Cannot resolve argument to string',
    argumentExpression.getText(),
    argumentExpression.getKindName(),
  );
};
