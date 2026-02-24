import { type Expression } from 'ts-morph';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { resolveExpressionToStringValue } from './resolve-expression-to-string-value';

export const convertKnownFunctionCallToJsonLogic = (
  functionName: string,
  args: Expression[],
): JsonLogicRule => {
  switch (functionName) {
    case 'getTargetObjectReadPermission': {
      const resolvedArgumentString = resolveExpressionToStringValue(args[0]);

      return { hasReadPermission: [resolvedArgumentString] };
    }
    case 'getTargetObjectWritePermission': {
      const resolvedArgumentString = resolveExpressionToStringValue(args[0]);

      return { hasWritePermission: [resolvedArgumentString] };
    }
    case 'isFeatureFlagEnabled': {
      const resolvedArgumentString = resolveExpressionToStringValue(args[0]);

      return { isFeatureFlagEnabled: [resolvedArgumentString] };
    }
    default:
      throw new Error(`Unknown param function: ${functionName}`);
  }
};
