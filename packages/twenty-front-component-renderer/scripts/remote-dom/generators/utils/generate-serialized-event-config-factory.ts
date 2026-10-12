import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

import { TYPE_NAMES } from '../constants';

export const generateSerializedEventConfigFactory = (
  sourceFile: SourceFile,
): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: TYPE_NAMES.SERIALIZED_EVENT_CONFIG_FACTORY,
        initializer: (writer) => {
          writer.write(
            '(eventType: string): RemoteElementEventListenerDefinition => (',
          );
          writer.block(() => {
            writer.writeLine(
              'dispatchEvent(this: Element, eventData: SerializedEventData) {',
            );
            writer.indent(() => {
              writer.writeLine('return createWorkerEventFromSerializedEvent({');
              writer.indent(() => {
                writer.writeLine('listeningElement: this,');
                writer.writeLine('eventType,');
                writer.writeLine('eventData,');
              });
              writer.writeLine('});');
            });
            writer.writeLine('},');
          });
          writer.write(')');
        },
      },
    ],
  });
};
