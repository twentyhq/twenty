import { type SourceFile, VariableDeclarationKind } from 'ts-morph';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { TYPE_NAMES } from '../constants';
import { type ComponentSchema, type PropertySchema } from '../schemas';
import { writeElementPropertiesConfig } from './write-element-properties-config';
import { resolveElementEventsType } from './resolve-element-events-type';

export const generateElementDefinition = ({
  sourceFile,
  component,
  specificProperties,
  commonEventNames,
  shouldUseCommonHtmlPropertiesConfig,
}: {
  sourceFile: SourceFile;
  component: ComponentSchema;
  specificProperties: Record<string, PropertySchema>;
  commonEventNames: Set<string>;
  shouldUseCommonHtmlPropertiesConfig: boolean;
}): void => {
  const isHtmlElement = isDefined(component.htmlTag);
  const hasCommonHtmlEvents = commonEventNames.size > 0 && isHtmlElement;
  const customEvents = component.events.filter(
    (event) => !hasCommonHtmlEvents || !commonEventNames.has(event),
  );
  const hasEvents = hasCommonHtmlEvents || isNonEmptyArray(customEvents);
  const hasSpecificProperties = isNonEmptyArray(
    Object.keys(specificProperties),
  );
  const hasProperties = isNonEmptyArray(Object.keys(component.properties));

  const propertiesType = hasSpecificProperties
    ? `${component.name}Properties`
    : hasProperties && isHtmlElement
      ? TYPE_NAMES.COMMON_PROPERTIES
      : TYPE_NAMES.EMPTY_RECORD;

  const eventsType = resolveElementEventsType({
    customEvents,
    hasCommonHtmlEvents,
  });

  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: `${component.name}Element`,
        initializer: (writer) => {
          writer.write('createRemoteElement<');
          writer.newLine();
          writer.indent(() => {
            writer.writeLine(`${propertiesType},`);
            writer.writeLine('Record<string, never>,');
            writer.writeLine(`${TYPE_NAMES.EMPTY_RECORD},`);
            writer.write(eventsType);
          });
          writer.newLine();
          writer.write('>');

          const hasConfig = hasProperties || hasEvents;
          if (!hasConfig) {
            writer.write('({})');
            return;
          }

          writer.write('(');
          writer.block(() => {
            writeElementPropertiesConfig({
              writer,
              component,
              specificProperties,
              shouldUseCommonHtmlPropertiesConfig,
            });
            if (hasEvents) {
              writer.write('events: ');
              writer.block(() => {
                if (hasCommonHtmlEvents) {
                  writer.writeLine('...HTML_COMMON_EVENTS_CONFIG,');
                }

                for (const event of customEvents) {
                  writer.writeLine(
                    `'${event}': createSerializedEventConfig('${event}'),`,
                  );
                }
              });
              writer.write(',');
              writer.newLine();
            }
          });
          writer.write(')');
        },
      },
    ],
  });
};
