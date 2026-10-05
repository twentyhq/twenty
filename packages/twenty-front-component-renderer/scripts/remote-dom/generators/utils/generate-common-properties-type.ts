import { type SourceFile } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { type PropertySchema } from '../schemas';
import { writePropertyTypeMembers } from './write-property-type-members';

export const generateCommonPropertiesType = ({
  sourceFile,
  commonProperties,
}: {
  sourceFile: SourceFile;
  commonProperties: Record<string, PropertySchema>;
}): void => {
  sourceFile.addTypeAlias({
    isExported: true,
    name: TYPE_NAMES.COMMON_PROPERTIES,
    type: (writer) => {
      writer.block(() => {
        writePropertyTypeMembers({ writer, properties: commonProperties });
      });
    },
  });
};
