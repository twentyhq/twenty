import { isString } from '@sniptt/guards';
import { type Expression, Node } from 'ts-morph';

import { resolvePropertyAccess } from '../resolve-constants';

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

  const resolvedPropertyAccessValue = resolvePropertyAccess(argumentText);

  if (isString(resolvedPropertyAccessValue)) {
    return resolvedPropertyAccessValue;
  }

  throw new Error(`Cannot resolve argument to string: ${argumentText}`);
};
