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
              writer.writeLine('applySerializedEventTargetProperties({');
              writer.indent(() => {
                writer.writeLine(
                  'element: this as unknown as Record<string, unknown>,',
                );
                writer.writeLine('eventData,');
              });
              writer.writeLine('});');
              writer.blankLine();
              writer.writeLine('return createWorkerEventFromSerializedEvent({');
              writer.indent(() => {
                writer.writeLine('target: this,');
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
