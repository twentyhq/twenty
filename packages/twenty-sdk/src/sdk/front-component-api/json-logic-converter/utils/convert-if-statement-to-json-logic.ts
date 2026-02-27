import { type IfStatement, Node } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { JsonLogicConversionError } from '../types/json-logic-conversion-error';
import { type JsonLogicRule } from '../types/json-logic-rule';
import { convertExpressionToJsonLogic } from './convert-expression-to-json-logic';

export const convertIfStatementToJsonLogic = ({
  statement,
}: {
  statement: IfStatement;
}): { condition: JsonLogicRule; result: JsonLogicRule } => {
  const condition = convertExpressionToJsonLogic({
    node: statement.getExpression(),
  });
  const thenBranchStatement = statement.getThenStatement();

  if (Node.isBlock(thenBranchStatement)) {
    const thenBlockStatements = thenBranchStatement.getStatements();

    const returnStatement = thenBlockStatements.find(Node.isReturnStatement);

    if (!isDefined(returnStatement)) {
      throw new JsonLogicConversionError(
        `If block must have a return statement: ${thenBranchStatement.getKindName()} (${thenBranchStatement.getText()})`,
      );
    }

    const returnExpression = returnStatement.getExpression();

    const result = isDefined(returnExpression)
      ? convertExpressionToJsonLogic({ node: returnExpression })
      : true;

    return { condition, result };
  }

  if (Node.isReturnStatement(thenBranchStatement)) {
    const returnExpression = thenBranchStatement.getExpression();

    const result = isDefined(returnExpression)
      ? convertExpressionToJsonLogic({ node: returnExpression })
      : true;

    return { condition, result };
  }

  throw new JsonLogicConversionError(
    `Unsupported then statement: ${thenBranchStatement.getKindName()} (${thenBranchStatement.getText()})`,
  );
};
