import { isDefined } from 'twenty-shared/utils';

import { getLogicFunctionSeedProjectFiles } from 'src/engine/core-modules/logic-function/logic-function-resource/utils/get-logic-function-seed-project-files.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const getLogicFunctionSeedSourceCodeOrThrow =
  async (): Promise<string> => {
    const seedProjectFiles = await getLogicFunctionSeedProjectFiles();

    const sourceFile = seedProjectFiles.find(
      (file) => file.name === 'index.ts',
    );

    if (!isDefined(sourceFile)) {
      throw new LogicFunctionException(
        'Logic function seed project should have one index.ts file',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_INVALID_SEED_PROJECT,
      );
    }

    return sourceFile.content.toString('utf-8');
  };
