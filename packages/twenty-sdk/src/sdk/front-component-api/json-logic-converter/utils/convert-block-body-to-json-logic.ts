import { type Block, Node } from 'ts-morph';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';

import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';
import { convertIfStatementToJsonLogic } from './convert-if-statement-to-json-logic';

export const convertBlockBodyToJsonLogic = (block: Block): JsonLogicRule => {
  const statements = block.getStatements();

  const conditionalBranches: Array<{
    condition: JsonLogicRule;
    result: JsonLogicRule;
  }> = [];

  let defaultReturnValue: JsonLogicRule | undefined;

  for (const statement of statements) {
    if (Node.isVariableStatement(statement)) {
      continue;
    }

    if (Node.isIfStatement(statement)) {
      const { condition, result } = convertIfStatementToJsonLogic(statement);

      conditionalBranches.push({ condition, result });
      continue;
    }

    if (Node.isReturnStatement(statement)) {
      const returnExpression = statement.getExpression();

      if (returnExpression) {
        defaultReturnValue = convertExpressionToJsonLogic(returnExpression);
      }

      continue;
    }

    throw new JsonLogicConversionError(
      'Unsupported block statement',
      statement.getText(),
      statement.getKindName(),
    );
  }

  if (!isNonEmptyArray(conditionalBranches) && isDefined(defaultReturnValue)) {
    return defaultReturnValue;
  }

  if (isNonEmptyArray(conditionalBranches)) {
    const jsonLogicIfArguments: JsonLogicRule[] = [];

    for (const { condition, result } of conditionalBranches) {
      jsonLogicIfArguments.push(condition, result);
    }

    if (isDefined(defaultReturnValue)) {
      jsonLogicIfArguments.push(defaultReturnValue);
    }

    return { if: jsonLogicIfArguments };
  }

  throw new JsonLogicConversionError(
    'Block body has no return or if statements',
  );
};
