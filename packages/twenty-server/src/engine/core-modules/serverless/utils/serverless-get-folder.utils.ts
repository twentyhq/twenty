import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const getServerlessFolder = ({
  serverlessFunction,
  version,
  toDelete = false,
}: {
  serverlessFunction: ServerlessFunctionEntity | FlatServerlessFunction;
  version?: 'draft' | 'latest' | (string & NonNullable<unknown>);
  toDelete?: boolean;
}) => {
  if (version === 'latest' && !isDefined(serverlessFunction.latestVersion)) {
    throw new ServerlessFunctionException(
      "Can't get 'latest' version when serverlessFunction 'latestVersion' is undefined",
      ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND,
    );
  }

  const computedVersion =
    version === 'latest' ? serverlessFunction.latestVersion : version;

  return join(
    'workspace-' + serverlessFunction.workspaceId,
    toDelete
      ? FileFolder.ServerlessFunctionToDelete
      : FileFolder.ServerlessFunction,
    serverlessFunction.id,
    computedVersion || '',
  );
};
