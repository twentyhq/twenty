import { type SourceFile } from 'ts-morph';
import { CUSTOM_ELEMENT_NAMES, INTERNAL_ELEMENT_CLASSES } from '../constants';
import { type ComponentSchema } from '../schemas';

export const generateCustomElementRegistrations = ({
  sourceFile,
  components,
}: {
  sourceFile: SourceFile;
  components: ComponentSchema[];
}): void => {
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
