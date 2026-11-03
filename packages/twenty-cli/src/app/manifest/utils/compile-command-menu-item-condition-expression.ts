import { type CompiledConditionExpression } from '@/app/source/types/compiled-condition-expression.type';
import { isObject, isString } from '@sniptt/guards';
import { type UniversalConditionalDisplay } from 'twenty-shared/types';
import {
  compileConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

export const compileCommandMenuItemConditionExpression = ({
  expression,
  expressionDescription,
  manifestKey,
}: {
  expression: string | CompiledConditionExpression | undefined;
  expressionDescription: string;
  manifestKey: 'conditionalAvailability' | 'conditionalPinned';
}): {
  conditionalDisplay?: UniversalConditionalDisplay;
  errors: string[];
  warnings: string[];
} => {
  if (!isDefined(expression)) {
    return { errors: [], warnings: [] };
  }

  if (isObject(expression) && 'errorMessage' in expression) {
    return {
      errors: [
        `${expressionDescription} cannot be compiled into a ${manifestKey} tree: ${expression.errorMessage}`,
      ],
      warnings: [],
    };
  }

  if (!isString(expression)) {
    return {
      conditionalDisplay: expression.conditionalDisplay ?? undefined,
      errors: [],
      warnings: [],
    };
  }

  const warnings = [
    `${expressionDescription} is a formula string; write it as code (for example numberOfSelectedRecords === 1) so the build can check it.`,
  ];

  try {
    return {
      conditionalDisplay:
        compileConditionalAvailabilityExpression(expression) ?? undefined,
      errors: [],
      warnings,
    };
  } catch (error) {
    return {
      errors: [
        `${expressionDescription} cannot be compiled into a ${manifestKey} tree: ${error instanceof Error ? error.message : String(error)}`,
      ],
      warnings,
    };
  }
};
