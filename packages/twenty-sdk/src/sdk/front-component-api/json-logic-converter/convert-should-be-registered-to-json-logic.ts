import { Project, SyntaxKind } from 'ts-morph';

import { convertArrowFunctionToJsonLogic } from './utils/convert-arrow-function-to-json-logic';

export const convertShouldBeRegisteredToJsonLogic = (
  arrowFunctionSource: string,
): unknown => {
  const project = new Project({ useInMemoryFileSystem: true });

  const sourceFile = project.createSourceFile(
    'temp.ts',
    `const fn = ${arrowFunctionSource};`,
  );

  const arrowFunctions = sourceFile.getDescendantsOfKind(
    SyntaxKind.ArrowFunction,
  );

  if (arrowFunctions.length === 0) {
    throw new Error('No arrow function found in source');
  }

  return convertArrowFunctionToJsonLogic(arrowFunctions[0]);
};
