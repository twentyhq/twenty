import path from 'path';
import slash from 'slash';

import { type CreateTypeScriptFileArgs } from '../types/CreateTypeScriptFileArgs';
import { type DeclarationOccurrence } from '../types/DeclarationOccurrence';
import { type ExportByBarrel } from '../types/ExportByBarrel';

import { partitionFileExportsByType } from './partitionFileExportsByType';

const INDEX_FILENAME = 'index';

export const generateModuleIndexFiles = (exportByBarrel: ExportByBarrel[]) => {
  return exportByBarrel.map<CreateTypeScriptFileArgs>(
    ({ barrel: { moduleDirectory }, allFileExports }) => {
      const content = allFileExports
        .sort((left, right) => left.file.localeCompare(right.file))
        .map(({ exports, file }) => {
          const { otherDeclarations, typeAndInterfaceDeclarations } =
            partitionFileExportsByType(exports);

          const fileWithoutExtension = path.parse(file).name;
          const pathToImport = slash(
            path.relative(
              moduleDirectory,
              path.join(path.dirname(file), fileWithoutExtension),
            ),
          );

          const mapDeclarationNameAndJoin = (
            declarations: DeclarationOccurrence[],
          ) => declarations.map(({ name }) => name).join(', ');

          const typeExport =
            typeAndInterfaceDeclarations.length > 0
              ? `export type { ${mapDeclarationNameAndJoin(typeAndInterfaceDeclarations)} } from "./${pathToImport}"`
              : '';
          const othersExport =
            otherDeclarations.length > 0
              ? `export { ${mapDeclarationNameAndJoin(otherDeclarations)} } from "./${pathToImport}"`
              : '';

          return [typeExport, othersExport]
            .filter((exportLine) => exportLine !== '')
            .join('\n');
        })
        .join('\n');

      return {
        content,
        path: moduleDirectory,
        filename: INDEX_FILENAME,
      };
    },
  );
};
