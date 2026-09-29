import { type Project, type SourceFile } from 'ts-morph';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { INTERNAL_ELEMENT_CLASSES } from './constants';
import { type ComponentSchema, type PropertySchema } from './schemas';
import { generateCommonEventsType } from './utils/generate-common-events-type';
import { generateCommonPropertiesConfig } from './utils/generate-common-properties-config';
import { generateCommonPropertiesType } from './utils/generate-common-properties-type';
import { generateCustomElementRegistrations } from './utils/generate-custom-element-registrations';
import { generateElementDefinition } from './utils/generate-element-definition';
import { generateElementPropertyType } from './utils/generate-element-property-type';
import { generateTagNameMapDeclaration } from './utils/generate-tag-name-map-declaration';
import { getSpecificProperties } from './utils/get-specific-properties';

export const generateRemoteElements = ({
  project,
  components,
  commonProperties,
  commonEvents = [],
}: {
  project: Project;
  components: ComponentSchema[];
  commonProperties: Record<string, PropertySchema>;
  commonEvents?: readonly string[];
}): SourceFile => {
  const sourceFile = project.createSourceFile('remote-elements.ts', '', {
    overwrite: true,
  });

  const commonEventNames = new Set(commonEvents);
  const shouldUseCommonHtmlPropertiesConfig = isNonEmptyArray(
    Object.keys(commonProperties),
  );

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/core/elements',
    namedImports: [
      'createRemoteElement',
      INTERNAL_ELEMENT_CLASSES.ROOT,
      INTERNAL_ELEMENT_CLASSES.FRAGMENT,
      { name: 'RemoteElementEventListenerDefinition', isTypeOnly: true },
      { name: 'RemoteElementEventListenersDefinition', isTypeOnly: true },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier:
      '@/remote/elements/utils/applySerializedEventTargetProperties',
    namedImports: ['applySerializedEventTargetProperties'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier:
      '@/remote/elements/utils/createWorkerEventFromSerializedEvent',
    namedImports: ['createWorkerEventFromSerializedEvent'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@/types/SerializedEventData',
    namedImports: [{ name: 'SerializedEventData', isTypeOnly: true }],
  });

  const commonPropertyNames = new Set(Object.keys(commonProperties));

  generateCommonPropertiesType({ sourceFile, commonProperties });

  if (commonEventNames.size > 0) {
    generateCommonEventsType({ sourceFile, events: commonEvents });
  }

  if (shouldUseCommonHtmlPropertiesConfig) {
    generateCommonPropertiesConfig({ sourceFile, commonProperties });
  }

  for (const component of components) {
    const specificProperties = isDefined(component.htmlTag)
      ? getSpecificProperties({ component, commonPropertyNames })
      : component.properties;

    generateElementPropertyType({ sourceFile, component, specificProperties });
    generateElementDefinition({
      sourceFile,
      component,
      specificProperties,
      commonEventNames,
      shouldUseCommonHtmlPropertiesConfig,
    });
  }

  generateCustomElementRegistrations({ sourceFile, components });

  sourceFile.addStatements(
    `export { ${INTERNAL_ELEMENT_CLASSES.ROOT}, ${INTERNAL_ELEMENT_CLASSES.FRAGMENT} };`,
  );

  generateTagNameMapDeclaration({ sourceFile, components });

  return sourceFile;
};
