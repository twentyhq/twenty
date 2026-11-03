import ts from 'typescript';

import { collectConditionExpressionNodes } from '@/app/source/collect-condition-expression-nodes';
import { compileConditionExpression } from '@/app/source/compile-condition-expression';
import { CONDITION_EXPRESSION_PROPERTY_NAMES } from '@/app/source/constants/condition-expression-property-names.constant';

export const compileConditionExpressionsInSource = ({
  source,
  filePath,
}: {
  source: string;
  filePath: string;
}): string => {
  if (
    !CONDITION_EXPRESSION_PROPERTY_NAMES.some((propertyName) =>
      source.includes(propertyName),
    )
  ) {
    return source;
  }

  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  return collectConditionExpressionNodes(sourceFile)
    .reverse()
    .reduce(
      (compiledSource, node) =>
        compiledSource.slice(0, node.getStart(sourceFile)) +
        JSON.stringify(compileConditionExpression({ node, sourceFile })) +
        compiledSource.slice(node.getEnd()),
      source,
    );
};
