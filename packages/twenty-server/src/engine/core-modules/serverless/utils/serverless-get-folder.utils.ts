import { join } from 'path';

import { isDefined } from 'twenty-shared';

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
  const computedVersion =
    version === 'latest' ? serverlessFunction.latestVersion : version;

  if (!isDefined(computedVersion)) {
    throw new ServerlessFunctionException(
      'Cannot compute serverless folder for undefined version',
      ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND,
    );
  }

  return join(
    'workspace-' + serverlessFunction.workspaceId,
    FileFolder.ServerlessFunction,
    serverlessFunction.id,
    computedVersion,
  );
};
