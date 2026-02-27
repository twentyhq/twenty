import { type Expression } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import {
  type JsonLogicOperator,
  type JsonLogicRule,
} from '../types/json-logic-rule';

import { resolveExpressionToStringValue } from './resolve-expression-to-string-value';

const KNOWN_FUNCTION_TO_OPERATOR: Record<string, JsonLogicOperator> = {
  getTargetObjectReadPermission: 'hasReadPermission',
  getTargetObjectWritePermission: 'hasWritePermission',
  isFeatureFlagEnabled: 'isFeatureFlagEnabled',
};

export const convertKnownFunctionCallToJsonLogic = ({
  functionName,
  args,
}: {
  functionName: string;
  args: Expression[];
}): JsonLogicRule => {
  const operatorName = KNOWN_FUNCTION_TO_OPERATOR[functionName];

  if (!isDefined(operatorName)) {
    throw new JsonLogicConversionError(
      `Unknown param function: ${functionName}`,
    );
  }

  const firstArgument = args[0];

  if (!isDefined(firstArgument)) {
    throw new JsonLogicConversionError(
      `Expected at least 1 argument for ${functionName}()`,
    );
  }

  const resolvedArgumentString = resolveExpressionToStringValue({
    argumentExpression: firstArgument,
  });

  return {
    [operatorName]: [resolvedArgumentString],
  };
};
