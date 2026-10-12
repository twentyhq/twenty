import { type CodeBlockWriter } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';
import { writePropertyConfigEntries } from './write-property-config-entries';

export const writeElementPropertiesConfig = ({
  writer,
  elementDescriptor,
  hasCommonPropertiesConfig,
}: {
  writer: CodeBlockWriter;
  elementDescriptor: RemoteElementDescriptor;
  hasCommonPropertiesConfig: boolean;
}): void => {
  const { isHtmlElement, hasSpecificProperties, specificProperties } =
    elementDescriptor;

  const shouldReuseCommonPropertiesConfig =
    isHtmlElement && !hasSpecificProperties && hasCommonPropertiesConfig;

  if (shouldReuseCommonPropertiesConfig) {
    writer.write(`properties: ${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`);
    writer.newLine();
    return;
  }

  const shouldSpreadCommonPropertiesConfig =
    isHtmlElement && hasSpecificProperties;

  writer.write('properties: ');
  writer.block(() => {
    if (shouldSpreadCommonPropertiesConfig) {
      writer.writeLine(`...${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`);
    }

    writePropertyConfigEntries({ writer, properties: specificProperties });
  });
  writer.write(',');
  writer.newLine();
};
