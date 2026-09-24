import { join } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type LogicFunctionFileWithoutFileRow = {
  applicationId: string;
  applicationUniversalIdentifier: string;
  fileFolder: FileFolder;
  resourcePath: string;
  path: string;
};

const buildFileRowKey = ({
  applicationId,
  path,
}: Pick<FileEntity, 'applicationId' | 'path'>) => `${applicationId}:${path}`;

export const findLogicFunctionFilesWithoutFileRow = ({
  flatLogicFunctions,
  flatApplicationMaps,
  existingFileRows,
}: {
  flatLogicFunctions: (FlatLogicFunction | undefined)[];
  flatApplicationMaps: FlatApplicationCacheMaps;
  existingFileRows: Pick<FileEntity, 'applicationId' | 'path'>[];
}): LogicFunctionFileWithoutFileRow[] => {
  const existingFileRowKeys = new Set(existingFileRows.map(buildFileRowKey));
  const filesWithoutFileRowByKey = new Map<
    string,
    LogicFunctionFileWithoutFileRow
  >();

  for (const flatLogicFunction of flatLogicFunctions) {
    if (!isDefined(flatLogicFunction)) {
      continue;
    }

    const flatApplication = findActiveFlatApplicationById(
      flatApplicationMaps,
      flatLogicFunction.applicationId,
    );

    if (!isDefined(flatApplication)) {
      continue;
    }

    const logicFunctionFiles = [
      {
        fileFolder: FileFolder.Source,
        resourcePath: flatLogicFunction.sourceHandlerPath,
      },
      {
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: flatLogicFunction.builtHandlerPath,
      },
    ];

    for (const { fileFolder, resourcePath } of logicFunctionFiles) {
      const file = {
        applicationId: flatApplication.id,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        fileFolder,
        resourcePath,
        path: join(fileFolder, resourcePath),
      };

      const fileRowKey = buildFileRowKey(file);

      if (!existingFileRowKeys.has(fileRowKey)) {
        filesWithoutFileRowByKey.set(fileRowKey, file);
      }
    }
  }

  return [...filesWithoutFileRowByKey.values()];
};
