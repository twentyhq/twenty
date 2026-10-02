import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

export const generateSerializedEventConfig = (sourceFile: SourceFile): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'createSerializedEventConfig',
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
