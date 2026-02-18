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
  useSharedEvents: boolean,
  useSharedPropertiesConfig: boolean,
): void => {
  const isHtml = isDefined(component.htmlTag);
  const useShared = useSharedEvents && isHtml;
  const hasEvents = component.events.length > 0;
  const hasSpecificProps = Object.keys(specificProperties).length > 0;
  const hasProps = Object.keys(component.properties).length > 0;

  const propsType = hasSpecificProps
    ? `${component.name}Properties`
    : hasProps && isHtml
      ? TYPE_NAMES.COMMON_PROPERTIES
      : TYPE_NAMES.EMPTY_RECORD;

  const eventsType = hasEvents
    ? useShared
      ? TYPE_NAMES.COMMON_EVENTS
      : `{ ${component.events.map((event) => `${event}(event: RemoteEvent<SerializedEventData>): void`).join('; ')} }`
    : TYPE_NAMES.EMPTY_RECORD;

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
              } else if (useSharedPropertiesConfig && isHtml) {
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
              writer.write(
                useShared
                  ? `events: [...${TYPE_NAMES.COMMON_EVENTS_ARRAY}],`
                  : `events: [${component.events.map((event) => `'${event}'`).join(', ')}],`,
              );
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

  const useSharedEvents = commonEvents.length > 0;
  const useSharedPropertiesConfig = Object.keys(commonProperties).length > 0;

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/core/elements',
    namedImports: [
      'createRemoteElement',
      INTERNAL_ELEMENT_CLASSES.ROOT,
      INTERNAL_ELEMENT_CLASSES.FRAGMENT,
      { name: 'RemoteEvent', isTypeOnly: true },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier:
      '../../../sdk/front-component-api/constants/SerializedEventData',
    namedImports: [{ name: 'SerializedEventData', isTypeOnly: true }],
  });

  const commonPropertyNames = new Set(Object.keys(commonProperties));

  generateCommonPropertiesType(sourceFile, commonProperties);

  if (useSharedEvents) {
    generateCommonEventsType(sourceFile, commonEvents);
  }

  if (useSharedPropertiesConfig) {
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
      useSharedEvents,
      useSharedPropertiesConfig,
    );
  }

  generateCustomElementRegistrations(sourceFile, components);

  sourceFile.addStatements(
    `export { ${INTERNAL_ELEMENT_CLASSES.ROOT}, ${INTERNAL_ELEMENT_CLASSES.FRAGMENT} };`,
  );

  generateTagNameMapDeclaration(sourceFile, components);

  return sourceFile;
};
