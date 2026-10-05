import { type CodeBlockWriter } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';

export const writeElementEventsConfig = ({
  writer,
  elementDescriptor,
}: {
  writer: CodeBlockWriter;
  elementDescriptor: RemoteElementDescriptor;
}): void => {
  writer.write('events: ');
  writer.block(() => {
    if (elementDescriptor.hasCommonHtmlEvents) {
      writer.writeLine(`...${TYPE_NAMES.COMMON_EVENTS_CONFIG},`);
    }

    for (const eventName of elementDescriptor.customEvents) {
      writer.writeLine(
        `'${eventName}': ${TYPE_NAMES.SERIALIZED_EVENT_CONFIG_FACTORY}('${eventName}'),`,
      );
    }
  });
  writer.write(',');
  writer.newLine();
};
