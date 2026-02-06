import {
  type Project,
  type SourceFile,
  VariableDeclarationKind,
  type WriterFunction,
} from 'ts-morph';

import {
  CUSTOM_ELEMENT_NAMES,
  INTERNAL_ELEMENT_CLASSES,
  TYPE_NAMES,
} from './constants';
import { type ComponentSchema, type PropertySchema } from './schemas';
import {
  addFileHeader,
  generatePropertiesConfig,
  schemaTypeToConstructor,
  schemaTypeToTs,
} from './utils';

type ElementGenerationOptions = {
  useSharedEvents: boolean;
  useSharedPropertiesConfig: boolean;
};

type ComponentWithSpecificProps = {
  component: ComponentSchema;
  specificProperties: Record<string, PropertySchema>;
};

const getElementSpecificProperties = (
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

const generatePropertyEntries = (
  properties: Record<string, PropertySchema>,
): string[] => {
  return Object.entries(properties).map(([name, schema]) => {
    const tsType = schemaTypeToTs(schema.type);
    const optional = schema.optional ? '?' : '';
    return `'${name}'${optional}: ${tsType}`;
  });
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
              const constructorType = schemaTypeToConstructor(schema.type);
              writer.writeLine(`'${name}': { type: ${constructorType} },`);
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
        writer.write(`${TYPE_NAMES.COMMON_PROPERTIES} & `);
        writer.block(() => {
          for (const entry of entries) {
            writer.writeLine(`${entry};`);
          }
        });
      },
    });
  }
};

const createPropertiesConfigWriter = (
  properties: Record<string, PropertySchema>,
): WriterFunction => {
  return (writer) => {
    writer.write(generatePropertiesConfig(properties));
  };
};

const generateElementDefinition = (
  sourceFile: SourceFile,
  component: ComponentSchema,
  specificProperties: Record<string, PropertySchema>,
  options: ElementGenerationOptions,
): void => {
  const { useSharedEvents, useSharedPropertiesConfig } = options;
  const hasEvents = component.events.length > 0;
  const hasSpecificProps = Object.keys(specificProperties).length > 0;
  const hasProps = Object.keys(component.properties).length > 0;

  const propsType = hasSpecificProps
    ? `${component.name}Properties`
    : hasProps
      ? TYPE_NAMES.COMMON_PROPERTIES
      : TYPE_NAMES.EMPTY_RECORD;

  const eventsType = hasEvents
    ? useSharedEvents
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
            writer.writeLine('Record<string, never>,');
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
              if (hasSpecificProps) {
                writer.write('properties: ');
                writer.block(() => {
                  writer.writeLine(
                    `...${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`,
                  );
                  for (const [name, schema] of Object.entries(
                    specificProperties,
                  )) {
                    const constructorType = schemaTypeToConstructor(
                      schema.type,
                    );
                    writer.writeLine(
                      `'${name}': { type: ${constructorType} },`,
                    );
                  }
                });
                writer.write(',');
                writer.newLine();
              } else if (useSharedPropertiesConfig) {
                writer.write(
                  `properties: ${TYPE_NAMES.COMMON_PROPERTIES_CONFIG},`,
                );
                writer.newLine();
              } else {
                writer.write('properties: ');
                createPropertiesConfigWriter(component.properties)(writer);
                writer.write(',');
                writer.newLine();
              }
            }
            if (hasEvents) {
              writer.write(
                useSharedEvents
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

const prepareComponentsWithSpecificProps = (
  components: ComponentSchema[],
  commonPropertyNames: Set<string>,
): ComponentWithSpecificProps[] => {
  return components.map((component) => ({
    component,
    specificProperties: getElementSpecificProperties(
      component,
      commonPropertyNames,
    ),
  }));
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

  const options: ElementGenerationOptions = {
    useSharedEvents,
    useSharedPropertiesConfig,
  };

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
    moduleSpecifier: '../../../sdk/front-component-common/SerializedEventData',
    namedImports: [{ name: 'SerializedEventData', isTypeOnly: true }],
  });

  const commonPropertyNames = new Set(Object.keys(commonProperties));
  const componentsWithProps = prepareComponentsWithSpecificProps(
    components,
    commonPropertyNames,
  );

  generateCommonPropertiesType(sourceFile, commonProperties);

  if (useSharedEvents) {
    generateCommonEventsType(sourceFile, commonEvents);
  }

  if (useSharedPropertiesConfig) {
    generateCommonPropertiesConfig(sourceFile, commonProperties);
  }

  for (const { component, specificProperties } of componentsWithProps) {
    generateElementPropertyType(sourceFile, component, specificProperties);
    generateElementDefinition(
      sourceFile,
      component,
      specificProperties,
      options,
    );
  }

  generateCustomElementRegistrations(sourceFile, components);

  sourceFile.addExportDeclaration({
    namedExports: [
      INTERNAL_ELEMENT_CLASSES.ROOT,
      INTERNAL_ELEMENT_CLASSES.FRAGMENT,
    ],
  });

  generateTagNameMapDeclaration(sourceFile, components);

  addFileHeader(sourceFile);

  return sourceFile;
};
