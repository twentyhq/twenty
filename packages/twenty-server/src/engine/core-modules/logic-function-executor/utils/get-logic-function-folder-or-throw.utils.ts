import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';
import { FileFolder } from 'twenty-shared/types';

import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const getLogicFunctionFolderOrThrow = ({
  flatLogicFunction,
  version,
  fileFolder = FileFolder.LogicFunction,
}: {
  flatLogicFunction: FlatLogicFunction;
  version?: 'draft' | 'latest' | (string & NonNullable<unknown>);
  fileFolder?:
    | FileFolder.LogicFunction
    | FileFolder.LogicFunctionToDelete
    | FileFolder.BuiltFunction;
}) => {
  if (version === 'latest' && !isDefined(flatLogicFunction.latestVersion)) {
    throw new LogicFunctionException(
      "Can't get 'latest' version when logicFunction 'latestVersion' is undefined",
      LogicFunctionExceptionCode.LOGIC_FUNCTION_VERSION_NOT_FOUND,
    );
  }

  const computedVersion =
    version === 'latest' ? flatLogicFunction.latestVersion : version;

  return join(
    'workspace-' + flatLogicFunction.workspaceId,
    fileFolder,
    flatLogicFunction.id,
    computedVersion || '',
  );
};
