import { type CodeBlockWriter } from 'ts-morph';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { TYPE_NAMES } from '../constants';
import { type ComponentSchema, type PropertySchema } from '../schemas';
import { writePropertyEntries } from './write-property-entries';

export const writeElementPropertiesConfig = ({
  writer,
  component,
  specificProperties,
  shouldUseCommonHtmlPropertiesConfig,
}: {
  writer: CodeBlockWriter;
  component: ComponentSchema;
  specificProperties: Record<string, PropertySchema>;
  shouldUseCommonHtmlPropertiesConfig: boolean;
}): void => {
  if (!isNonEmptyArray(Object.keys(component.properties))) {
    return;
  }

  const isHtmlElement = isDefined(component.htmlTag);
  const hasSpecificProperties = isNonEmptyArray(
    Object.keys(specificProperties),
  );
  const shouldReuseCommonProperties =
    isHtmlElement &&
    !hasSpecificProperties &&
    shouldUseCommonHtmlPropertiesConfig;

  if (shouldReuseCommonProperties) {
    writer.write(`properties: ${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`);
    writer.newLine();
    return;
  }

  writer.write('properties: ');
  writer.block(() => {
    if (isHtmlElement && hasSpecificProperties) {
      writer.writeLine(`...${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`);
    }
    writePropertyEntries({ writer, properties: specificProperties });
  });
  writer.write(',');
  writer.newLine();
};
