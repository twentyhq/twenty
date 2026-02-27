import { Project } from 'ts-morph';

import { type JsonLogicRule } from './types/json-logic-rule';
import { convertSourceFileToJsonLogic } from './utils/convert-source-file-to-json-logic';

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

  return convertSourceFileToJsonLogic({ sourceFile });
};
