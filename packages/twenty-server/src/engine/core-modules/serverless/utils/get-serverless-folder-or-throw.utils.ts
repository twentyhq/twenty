import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';
import { FileFolder } from 'twenty-shared/types';

import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const getServerlessFolderOrThrow = ({
  flatServerlessFunction,
  version,
  fileFolder = FileFolder.ServerlessFunction,
}: {
  flatServerlessFunction: FlatServerlessFunction;
  version?: 'draft' | 'latest' | (string & NonNullable<unknown>);
  fileFolder?:
    | FileFolder.ServerlessFunction
    | FileFolder.ServerlessFunctionToDelete
    | FileFolder.BuiltFunction;
}) => {
  if (
    version === 'latest' &&
    !isDefined(flatServerlessFunction.latestVersion)
  ) {
    throw new ServerlessFunctionException(
      "Can't get 'latest' version when serverlessFunction 'latestVersion' is undefined",
      ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND,
    );
  }

  const computedVersion =
    version === 'latest' ? flatServerlessFunction.latestVersion : version;

  return join(
    'workspace-' + flatServerlessFunction.workspaceId,
    fileFolder,
    flatServerlessFunction.id,
    computedVersion || '',
  );
};
