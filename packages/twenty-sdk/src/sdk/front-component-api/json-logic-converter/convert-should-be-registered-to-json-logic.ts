import { Project, SyntaxKind } from 'ts-morph';

import { JsonLogicConversionError } from '@/sdk/front-component-api/json-logic-converter/types/json-logic-conversion-error';
import { convertArrowFunctionToJsonLogic } from '@/sdk/front-component-api/json-logic-converter/utils/convert-arrow-function-to-json-logic';
import { isDefined } from 'twenty-shared/utils';
import { type JsonLogicRule } from './types/json-logic-rule';

export const convertShouldBeRegisteredToJsonLogic = ({
  arrowFunctionSource,
}: {
  arrowFunctionSource: string;
}): JsonLogicRule => {
  const project = new Project({ useInMemoryFileSystem: true });

  const sourceFile = project.createSourceFile(
    'temp.ts',
    `const fn = ${arrowFunctionSource};`,
  );

  const arrowFunctionNodes = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  );

  const firstArrowFunction = arrowFunctionNodes[0];

  if (!isDefined(firstArrowFunction)) {
    throw new JsonLogicConversionError('No arrow function found in source');
  }

  return convertArrowFunctionToJsonLogic({ node: firstArrowFunction });
};
