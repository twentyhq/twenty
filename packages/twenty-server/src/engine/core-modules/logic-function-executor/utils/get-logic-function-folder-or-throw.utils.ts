import { join } from 'path';

import { FileFolder } from 'twenty-shared/types';

import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const WORKFLOW_CODE_SOURCE_PREFIX = 'workflow/code-source';

export const getLogicFunctionFolderOrThrow = ({
  flatLogicFunction,
  fileFolder = FileFolder.Source,
}: {
  flatLogicFunction: FlatLogicFunction;
  fileFolder?: FileFolder.Source | FileFolder.BuiltLogicFunction;
}) => {
  if (fileFolder === FileFolder.Source) {
    return join(
      'workspace-' + flatLogicFunction.workspaceId,
      fileFolder,
      WORKFLOW_CODE_SOURCE_PREFIX,
      flatLogicFunction.id,
    );
  }

  return join(
    'workspace-' + flatLogicFunction.workspaceId,
    fileFolder,
    flatLogicFunction.id,
  );
};
