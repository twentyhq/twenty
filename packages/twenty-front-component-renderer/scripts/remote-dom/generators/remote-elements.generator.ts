import { type Project, type SourceFile } from 'ts-morph';

import { INTERNAL_ELEMENT_CLASSES } from './constants';
import { type ComponentSchema, type PropertySchema } from './schemas';
import { generateCommonEventsArray } from './utils/generate-common-events-array';
import { generateCommonEventsConfig } from './utils/generate-common-events-config';
import { generateCommonEventsType } from './utils/generate-common-events-type';
import { generateCommonPropertiesConfig } from './utils/generate-common-properties-config';
import { generateCommonPropertiesType } from './utils/generate-common-properties-type';
import { generateCustomElementRegistrations } from './utils/generate-custom-element-registrations';
import { generateElementDefinition } from './utils/generate-element-definition';
import { generateElementPropertiesType } from './utils/generate-element-properties-type';
import { generateRemoteElementsImports } from './utils/generate-remote-elements-imports';
import { generateSerializedEventConfigFactory } from './utils/generate-serialized-event-config-factory';
import { generateTagNameMapDeclaration } from './utils/generate-tag-name-map-declaration';
import { getRemoteElementDescriptor } from './utils/get-remote-element-descriptor';

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

  const commonPropertyNames = new Set(Object.keys(commonProperties));
  const commonEventNames = new Set(commonEvents);
  const hasCommonProperties = commonPropertyNames.size > 0;
  const hasCommonEvents = commonEventNames.size > 0;

  generateRemoteElementsImports(sourceFile);

  generateCommonPropertiesType({ sourceFile, commonProperties });

  if (hasCommonEvents) {
    generateCommonEventsType({ sourceFile, commonEvents });
    generateCommonEventsArray({ sourceFile, commonEvents });
    generateSerializedEventConfigFactory(sourceFile);
    generateCommonEventsConfig(sourceFile);
  }

  if (hasCommonProperties) {
    generateCommonPropertiesConfig({ sourceFile, commonProperties });
  }

  for (const component of components) {
    const elementDescriptor = getRemoteElementDescriptor({
      component,
      commonPropertyNames,
      commonEventNames,
    });

    generateElementPropertiesType({ sourceFile, elementDescriptor });
    generateElementDefinition({
      sourceFile,
      elementDescriptor,
      hasCommonPropertiesConfig: hasCommonProperties,
    });
  }

  generateCustomElementRegistrations({ sourceFile, components });

  sourceFile.addStatements(
    `export { ${INTERNAL_ELEMENT_CLASSES.ROOT}, ${INTERNAL_ELEMENT_CLASSES.FRAGMENT} };`,
  );

  generateTagNameMapDeclaration({ sourceFile, components });

  return sourceFile;
};
