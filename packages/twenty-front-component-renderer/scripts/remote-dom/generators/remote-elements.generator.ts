import {
  type CodeBlockWriter,
  type Project,
  type SourceFile,
  VariableDeclarationKind,
} from 'ts-morph';

import { isDefined } from 'twenty-shared/utils';
import {
  CUSTOM_ELEMENT_NAMES,
  INTERNAL_ELEMENT_CLASSES,
  TYPE_NAMES,
} from './constants';
import { type ComponentSchema, type PropertySchema } from './schemas';
import { schemaTypeToConstructor } from './utils';

const schemaTypeToTs = (type: PropertySchema['type']): string => type;

const generatePropertyEntries = (
  properties: Record<string, PropertySchema>,
): string[] =>
  Object.entries(properties).map(([name, schema]) => {
    const optional = schema.optional ? '?' : '';
    return `'${name}'${optional}: ${schemaTypeToTs(schema.type)}`;
  });

const writePropertyEntries = (
  writer: CodeBlockWriter,
  properties: Record<string, PropertySchema>,
): void => {
  for (const [name, schema] of Object.entries(properties)) {
    writer.writeLine(
      `'${name}': { type: ${schemaTypeToConstructor(schema.type)} },`,
    );
  }
};

const getSpecificProperties = (
  component: ComponentSchema,
  commonPropertyNames: Set<string>,
): Record<string, PropertySchema> => {
  const specific: Record<string, PropertySchema> = {};
  for (const [name, schema] of Object.entries(component.properties)) {
    if (!commonPropertyNames.has(name)) {
      specific[name] = schema;
    }
  }
  return specific;
};

const generateCommonPropertiesType = (
  sourceFile: SourceFile,
  commonProperties: Record<string, PropertySchema>,
): void => {
  const entries = generatePropertyEntries(commonProperties);

  sourceFile.addTypeAlias({
    isExported: true,
    name: TYPE_NAMES.COMMON_PROPERTIES,
    type: (writer) => {
      writer.block(() => {
        for (const entry of entries) {
          writer.writeLine(`${entry};`);
        }
      });
    },
  });
};

const generateCommonEventsType = (
  sourceFile: SourceFile,
  events: readonly string[],
): void => {
  if (events.length === 0) {
    return;
  }

  sourceFile.addTypeAlias({
    isExported: true,
    name: TYPE_NAMES.COMMON_EVENTS,
    type: (writer) => {
      writer.block(() => {
        for (const event of events) {
          writer.writeLine(
            `${event}(event: RemoteEvent<SerializedEventData>): void;`,
          );
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
              writer.writeLine('applySerializedEventTargetProperties(');
              writer.indent(() => {
                writer.writeLine('this as unknown as Record<string, unknown>,');
                writer.writeLine('eventData,');
              });
              writer.writeLine(');');
              writer.blankLine();
              writer.writeLine('const event = new CustomEvent(eventType, {');
              writer.indent(() => {
                writer.writeLine('detail: eventData,');
              });
              writer.writeLine('}) as RemoteEvent<SerializedEventData>;');
              writer.blankLine();
              writer.writeLine('applySerializedEventProperties(');
              writer.indent(() => {
                writer.writeLine(
                  'event as unknown as Record<string, unknown>,',
                );
                writer.writeLine('eventData,');
              });
              writer.writeLine(');');
              writer.blankLine();
              writer.writeLine('return event;');
            });
            writer.writeLine('},');
          });
          writer.write(')');
        },
      },
    ],
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: 'HTML_COMMON_EVENTS_CONFIG',
        initializer: (writer) => {
          writer.writeLine('Object.fromEntries(');
          writer.indent(() => {
            writer.writeLine(
              `${TYPE_NAMES.COMMON_EVENTS_ARRAY}.map((eventType) => [`,
            );
            writer.indent(() => {
              writer.writeLine('eventType,');
              writer.writeLine('createSerializedEventConfig(eventType),');
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

const generateCommonPropertiesConfig = (
  sourceFile: SourceFile,
  commonProperties: Record<string, PropertySchema>,
): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: TYPE_NAMES.COMMON_PROPERTIES_CONFIG,
        initializer: (writer) => {
          writer.block(() => {
            for (const [name, schema] of Object.entries(commonProperties)) {
              writer.writeLine(
                `'${name}': { type: ${schemaTypeToConstructor(schema.type)} },`,
              );
            }
          });
        },
      },
    ],
  });
};

const generateElementPropertyType = (
  sourceFile: SourceFile,
  component: ComponentSchema,
  specificProperties: Record<string, PropertySchema>,
): void => {
  const hasSpecificProps = Object.keys(specificProperties).length > 0;

  if (hasSpecificProps) {
    const entries = generatePropertyEntries(specificProperties);
    sourceFile.addTypeAlias({
      isExported: true,
      name: `${component.name}Properties`,
      type: (writer) => {
        if (isDefined(component.htmlTag)) {
          writer.write(`${TYPE_NAMES.COMMON_PROPERTIES} & `);
        }
        writer.block(() => {
          for (const entry of entries) {
            writer.writeLine(`${entry};`);
          }
        });
      },
    });
  }
};

const generateElementDefinition = (
  sourceFile: SourceFile,
  component: ComponentSchema,
  specificProperties: Record<string, PropertySchema>,
  commonEventNames: Set<string>,
  shouldUseCommonHtmlPropertiesConfig: boolean,
): void => {
  const isHtml = isDefined(component.htmlTag);
  const hasCommonHtmlEvents = commonEventNames.size > 0 && isHtml;
  const customEvents = component.events.filter(
    (event) => !hasCommonHtmlEvents || !commonEventNames.has(event),
  );
  const hasEvents = hasCommonHtmlEvents || customEvents.length > 0;
  const hasSpecificProps = Object.keys(specificProperties).length > 0;
  const hasProps = Object.keys(component.properties).length > 0;

  const propsType = hasSpecificProps
    ? `${component.name}Properties`
    : hasProps && isHtml
      ? TYPE_NAMES.COMMON_PROPERTIES
      : TYPE_NAMES.EMPTY_RECORD;

  const customEventsInline = customEvents
    .map((event) => `${event}(event: RemoteEvent<SerializedEventData>): void`)
    .join('; ');

  let eventsType: string = TYPE_NAMES.EMPTY_RECORD;

  if (hasCommonHtmlEvents && customEvents.length > 0) {
    eventsType = `${TYPE_NAMES.COMMON_EVENTS} & { ${customEventsInline} }`;
  } else if (hasCommonHtmlEvents) {
    eventsType = TYPE_NAMES.COMMON_EVENTS;
  } else if (customEvents.length > 0) {
    eventsType = `{ ${customEventsInline} }`;
  }

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
            writer.writeLine(`${propsType},`);
            writer.writeLine('Record<string, never>,');
            writer.writeLine(`${TYPE_NAMES.EMPTY_RECORD},`);
            writer.write(eventsType);
          });
          writer.newLine();
          writer.write('>');

          const hasConfig = hasProps || hasEvents;
          if (!hasConfig) {
            writer.write('({})');
            return;
          }

          writer.write('(');
          writer.block(() => {
            if (hasProps) {
              if (hasSpecificProps && isHtml) {
                writer.write('properties: ');
                writer.block(() => {
                  writer.writeLine(
                    `...${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`,
                  );
                  writePropertyEntries(writer, specificProperties);
                });
                writer.write(',');
                writer.newLine();
              } else if (shouldUseCommonHtmlPropertiesConfig && isHtml) {
                writer.write(
                  `properties: ${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`,
                );
                writer.newLine();
              } else {
                writer.write('properties: ');
                writer.block(() => {
                  writePropertyEntries(writer, specificProperties);
                });
                writer.write(',');
                writer.newLine();
              }
            }
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

const generateCustomElementRegistrations = (
  sourceFile: SourceFile,
  components: ComponentSchema[],
): void => {
  for (const component of components) {
    sourceFile.addStatements(
      `customElements.define('${component.customElementName}', ${component.name}Element);`,
    );
  }
  sourceFile.addStatements(
    `customElements.define('${CUSTOM_ELEMENT_NAMES.ROOT}', ${INTERNAL_ELEMENT_CLASSES.ROOT});`,
  );
  sourceFile.addStatements(
    `customElements.define('${CUSTOM_ELEMENT_NAMES.FRAGMENT}', ${INTERNAL_ELEMENT_CLASSES.FRAGMENT});`,
  );
};

const generateTagNameMapDeclaration = (
  sourceFile: SourceFile,
  components: ComponentSchema[],
): void => {
  sourceFile.addStatements((writer) => {
    writer.writeLine('declare global {');
    writer.indent(() => {
      writer.writeLine('interface HTMLElementTagNameMap {');
      writer.indent(() => {
        for (const component of components) {
          writer.writeLine(
            `'${component.customElementName}': InstanceType<typeof ${component.name}Element>;`,
          );
        }
        writer.writeLine(
          `'${CUSTOM_ELEMENT_NAMES.ROOT}': InstanceType<typeof ${INTERNAL_ELEMENT_CLASSES.ROOT}>;`,
        );
        writer.writeLine(
          `'${CUSTOM_ELEMENT_NAMES.FRAGMENT}': InstanceType<typeof ${INTERNAL_ELEMENT_CLASSES.FRAGMENT}>;`,
        );
      });
      writer.writeLine('}');
    });
    writer.writeLine('}');
  });
};

export const generateRemoteElements = (
  project: Project,
  components: ComponentSchema[],
  commonProperties: Record<string, PropertySchema>,
  commonEvents: readonly string[] = [],
): SourceFile => {
  const sourceFile = project.createSourceFile('remote-elements.ts', '', {
    overwrite: true,
  });

  const commonEventNames = new Set(commonEvents);
  const shouldUseCommonHtmlPropertiesConfig =
    Object.keys(commonProperties).length > 0;

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/core/elements',
    namedImports: [
      'createRemoteElement',
      INTERNAL_ELEMENT_CLASSES.ROOT,
      INTERNAL_ELEMENT_CLASSES.FRAGMENT,
      { name: 'RemoteEvent', isTypeOnly: true },
      { name: 'RemoteElementEventListenerDefinition', isTypeOnly: true },
      { name: 'RemoteElementEventListenersDefinition', isTypeOnly: true },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@/constants/applySerializedEventProperties',
    namedImports: ['applySerializedEventProperties'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@/constants/applySerializedEventTargetProperties',
    namedImports: ['applySerializedEventTargetProperties'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@/types/SerializedEventData',
    namedImports: [{ name: 'SerializedEventData', isTypeOnly: true }],
  });

  const commonPropertyNames = new Set(Object.keys(commonProperties));

  generateCommonPropertiesType(sourceFile, commonProperties);

  if (commonEventNames.size > 0) {
    generateCommonEventsType(sourceFile, commonEvents);
  }

  if (shouldUseCommonHtmlPropertiesConfig) {
    generateCommonPropertiesConfig(sourceFile, commonProperties);
  }

  for (const component of components) {
    const specificProperties = isDefined(component.htmlTag)
      ? getSpecificProperties(component, commonPropertyNames)
      : component.properties;

    generateElementPropertyType(sourceFile, component, specificProperties);
    generateElementDefinition(
      sourceFile,
      component,
      specificProperties,
      commonEventNames,
      shouldUseCommonHtmlPropertiesConfig,
    );
  }

  generateCustomElementRegistrations(sourceFile, components);

  sourceFile.addStatements(
    `export { ${INTERNAL_ELEMENT_CLASSES.ROOT}, ${INTERNAL_ELEMENT_CLASSES.FRAGMENT} };`,
  );

  generateTagNameMapDeclaration(sourceFile, components);

  return sourceFile;
};
