import { type IfStatement, Node } from 'ts-morph';

import { type JsonLogicRule } from '../types/json-logic-rule';

import { isDefined } from 'twenty-shared/utils';
import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';

export const convertIfStatementToJsonLogic = (
  statement: IfStatement,
): { condition: JsonLogicRule; result: JsonLogicRule } => {
  const condition = convertExpressionToJsonLogic(statement.getExpression());
  const thenBranchStatement = statement.getThenStatement();

  if (Node.isBlock(thenBranchStatement)) {
    const thenBlockStatements = thenBranchStatement.getStatements();
    const returnStatement = thenBlockStatements.find(Node.isReturnStatement);

    if (!isDefined(returnStatement)) {
      throw new Error('If block must have a return statement');
    }

    const returnExpression = returnStatement.getExpression();

    const result = isDefined(returnExpression)
      ? convertExpressionToJsonLogic(returnExpression)
      : true;

    return { condition, result };
  }

  if (Node.isReturnStatement(thenBranchStatement)) {
    const returnExpression = thenBranchStatement.getExpression();

    const result = isDefined(returnExpression)
      ? convertExpressionToJsonLogic(returnExpression)
      : true;

    return { condition, result };
  }

  throw new Error(
    `Unsupported then statement: ${thenBranchStatement.getKindName()}`,
  );
};
