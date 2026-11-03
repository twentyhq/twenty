import { compileConditionalAvailabilityExpressionNode } from 'twenty-shared/utils';
import type ts from 'typescript';

import { toConditionalAvailabilityExpressionNode } from '@/app/source/to-conditional-availability-expression-node';
import { toConditionalAvailabilityExpressionString } from '@/app/source/to-conditional-availability-expression-string';
import { type CompiledConditionExpression } from '@/app/source/types/compiled-condition-expression.type';

export const compileConditionExpression = ({
  node,
  sourceFile,
}: {
  node: ts.Expression;
  sourceFile: ts.SourceFile;
}): CompiledConditionExpression => {
  const expression = node.getText(sourceFile);

  try {
    return {
      conditionalDisplay: compileConditionalAvailabilityExpressionNode({
        expressionNode: toConditionalAvailabilityExpressionNode({
          node,
          sourceFile,
        }),
        expression,
        source: toConditionalAvailabilityExpressionString(expression),
      }),
    };
  } catch (error) {
    return {
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
};
