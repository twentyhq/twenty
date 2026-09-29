import { type SourceFile } from 'ts-morph';
import { TYPE_NAMES } from '../constants';
import { type PropertySchema } from '../schemas';
import { generatePropertyEntries } from './generate-property-entries';

export const generateCommonPropertiesType = ({
  sourceFile,
  commonProperties,
}: {
  sourceFile: SourceFile;
  commonProperties: Record<string, PropertySchema>;
}): void => {
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
