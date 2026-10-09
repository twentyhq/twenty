import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

import { TYPE_NAMES } from '../constants';

export const generateCommonEventsConfig = (sourceFile: SourceFile): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: TYPE_NAMES.COMMON_EVENTS_CONFIG,
        initializer: (writer) => {
          writer.writeLine('Object.fromEntries(');
          writer.indent(() => {
            writer.writeLine(
              `${TYPE_NAMES.COMMON_EVENTS_ARRAY}.map((eventType) => [`,
            );
            writer.indent(() => {
              writer.writeLine('eventType,');
              writer.writeLine(
                `${TYPE_NAMES.SERIALIZED_EVENT_CONFIG_FACTORY}(eventType),`,
              );
            });
            writer.writeLine(']),');
          });
          writer.write(
            `) as RemoteElementEventListenersDefinition<${TYPE_NAMES.COMMON_EVENTS}>`,
          );
        },
      },
    ],
  });
};
