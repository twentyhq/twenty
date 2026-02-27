import { isString } from '@sniptt/guards';
import { type Expression, Node } from 'ts-morph';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';

import { tryResolveKnownConstant } from './try-resolve-known-constant';

export const resolveExpressionToStringValue = ({
  argumentExpression,
}: {
  argumentExpression: Expression;
}): string => {
  if (Node.isStringLiteral(argumentExpression)) {
    return argumentExpression.getLiteralValue();
  }

  const argumentText = argumentExpression.getText();
  const resolvedConstant = tryResolveKnownConstant({
    constantPath: argumentText,
  });

  if (isString(resolvedConstant)) {
    return resolvedConstant;
  }

  throw new JsonLogicConversionError(
    `Cannot resolve argument to string: ${argumentExpression.getKindName()} (${argumentExpression.getText()})`,
  );
};
