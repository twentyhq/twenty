import { join } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { findActiveFlatApplicationById } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-id.util';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export type LogicFunctionFile = {
  applicationId: string;
  applicationUniversalIdentifier: string;
  fileFolder: FileFolder;
  resourcePath: string;
  path: string;
};

export const buildLogicFunctionFiles = ({
  flatLogicFunctions,
  flatApplicationMaps,
}: {
  flatLogicFunctions: (FlatLogicFunction | undefined)[];
  flatApplicationMaps: FlatApplicationCacheMaps;
}): LogicFunctionFile[] => {
  const logicFunctionFileByKey = new Map<string, LogicFunctionFile>();

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

    const handlerFiles = [
      {
        fileFolder: FileFolder.Source,
        resourcePath: flatLogicFunction.sourceHandlerPath,
      },
      {
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: flatLogicFunction.builtHandlerPath,
      },
    ];

    for (const { fileFolder, resourcePath } of handlerFiles) {
      const path = join(fileFolder, resourcePath);

      logicFunctionFileByKey.set(`${flatApplication.id}:${path}`, {
        applicationId: flatApplication.id,
        applicationUniversalIdentifier: flatApplication.universalIdentifier,
        fileFolder,
        resourcePath,
        path,
      });
    }
  }

  return [...logicFunctionFileByKey.values()];
};
