import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

import { TYPE_NAMES } from '../constants';

export const generateCommonEventsArray = ({
  sourceFile,
  commonEvents,
}: {
  sourceFile: SourceFile;
  commonEvents: readonly string[];
}): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: TYPE_NAMES.COMMON_EVENTS_ARRAY,
        initializer: (writer) => {
          writer.write('[');
          writer.newLine();
          writer.indent(() => {
            for (const eventName of commonEvents) {
              writer.writeLine(`'${eventName}',`);
            }
          });
          writer.write('] as const');
        },
      },
    ],
  });
};
