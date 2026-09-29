import { type SourceFile } from 'ts-morph';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { TYPE_NAMES } from '../constants';
import { type ComponentSchema, type PropertySchema } from '../schemas';
import { generatePropertyEntries } from './generate-property-entries';

export const generateElementPropertyType = ({
  sourceFile,
  component,
  specificProperties,
}: {
  sourceFile: SourceFile;
  component: ComponentSchema;
  specificProperties: Record<string, PropertySchema>;
}): void => {
  const hasSpecificProperties = isNonEmptyArray(
    Object.keys(specificProperties),
  );

  if (!hasSpecificProperties) {
    return;
  }

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
};
