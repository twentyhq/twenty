import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { type PropertySchema } from '../schemas';
import { writePropertyConfigEntries } from './write-property-config-entries';

export const generateCommonPropertiesConfig = ({
  sourceFile,
  commonProperties,
}: {
  sourceFile: SourceFile;
  commonProperties: Record<string, PropertySchema>;
}): void => {
  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: TYPE_NAMES.COMMON_PROPERTIES_CONFIG,
        initializer: (writer) => {
          writer.block(() => {
            writePropertyConfigEntries({
              writer,
              properties: commonProperties,
            });
          });
        },
      },
    ],
  });
};
