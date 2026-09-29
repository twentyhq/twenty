import { isNonEmptyArray } from 'twenty-shared/utils';

import { type SourceFile, VariableDeclarationKind } from 'ts-morph';
import { TYPE_NAMES } from '../constants';
import { generateSerializedEventConfig } from './generate-serialized-event-config';
import { generateCommonEventsConfig } from './generate-common-events-config';

export const generateCommonEventsType = ({
  sourceFile,
  events,
}: {
  sourceFile: SourceFile;
  events: readonly string[];
}): void => {
  if (!isNonEmptyArray(events)) {
    return;
  }

  sourceFile.addTypeAlias({
    isExported: true,
    name: TYPE_NAMES.COMMON_EVENTS,
    type: (writer) => {
      writer.block(() => {
        for (const event of events) {
          writer.writeLine(`${event}(event: Event): void;`);
        }
      });
    },
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: TYPE_NAMES.COMMON_EVENTS_ARRAY,
        initializer: (writer) => {
          writer.write('[');
          writer.newLine();
          writer.indent(() => {
            for (const event of events) {
              writer.writeLine(`'${event}',`);
            }
          });
          writer.write('] as const');
        },
      },
    ],
  });

  generateSerializedEventConfig(sourceFile);

  generateCommonEventsConfig(sourceFile);
};
