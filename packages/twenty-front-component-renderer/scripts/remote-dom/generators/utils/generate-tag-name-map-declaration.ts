import { type SourceFile } from 'ts-morph';
import { CUSTOM_ELEMENT_NAMES, INTERNAL_ELEMENT_CLASSES } from '../constants';
import { type ComponentSchema } from '../schemas';

export const generateTagNameMapDeclaration = ({
  sourceFile,
  components,
}: {
  sourceFile: SourceFile;
  components: ComponentSchema[];
}): void => {
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
