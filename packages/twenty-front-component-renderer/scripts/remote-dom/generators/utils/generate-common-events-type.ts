import { type SourceFile } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { getEventListenerSignature } from './get-event-listener-signature';

export const generateCommonEventsType = ({
  sourceFile,
  commonEvents,
}: {
  sourceFile: SourceFile;
  commonEvents: readonly string[];
}): void => {
  sourceFile.addTypeAlias({
    isExported: true,
    name: TYPE_NAMES.COMMON_EVENTS,
    type: (writer) => {
      writer.block(() => {
        for (const eventName of commonEvents) {
          writer.writeLine(`${getEventListenerSignature(eventName)};`);
        }
      });
    },
  });
};
