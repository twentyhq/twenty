import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

export const getServerlessFolder = ({
  serverlessFunction,
  version,
}: {
  serverlessFunction: ServerlessFunctionEntity;
  version?: 'draft' | 'latest' | (string & NonNullable<unknown>);
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
    FileFolder.ServerlessFunction,
    serverlessFunction.id,
    computedVersion || '',
  );
};
