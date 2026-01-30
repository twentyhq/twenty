import { join } from 'path';

import { FileFolder } from 'twenty-shared/types';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

export const getLogicFunctionFolderOrThrow = ({
  flatLogicFunction,
  fileFolder = FileFolder.LogicFunction,
}: {
  flatLogicFunction: FlatLogicFunction;
  fileFolder?:
    | FileFolder.LogicFunction
    | FileFolder.LogicFunctionToDelete
    | FileFolder.BuiltLogicFunction;
}) => {
  return join(
    'workspace-' + flatLogicFunction.workspaceId,
    fileFolder,
    flatLogicFunction.id,
  );
};
