import { join } from 'path';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export const getServerlessFolder = ({
  serverlessFunction,
  version,
}: {
  serverlessFunction: ServerlessFunctionEntity;
  version?: 'draft' | 'latest' | (string & NonNullable<unknown>);
}) => {
  const computedVersion =
    version === 'latest' ? serverlessFunction.latestVersion : version;

  return join(
    'workspace-' + serverlessFunction.workspaceId,
    FileFolder.ServerlessFunction,
    serverlessFunction.id,
    computedVersion || '',
  );
};
