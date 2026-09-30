import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTwentyOrmUserInputError } from 'src/engine/twenty-orm/utils/is-twenty-orm-user-input-error.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import {
  CommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

const LOGIC_FUNCTION_INFRASTRUCTURE_FAILURE_CODES = [
  LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
  LogicFunctionExceptionCode.LOGIC_FUNCTION_PLATFORM_EXECUTION_ERROR,
  LogicFunctionExceptionCode.LOGIC_FUNCTION_PREBUILT_BUNDLE_NOT_INSTALLED,
];

export const isToolExecutionRefusal = (error: unknown): boolean => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return true;
  }

  if (error instanceof WorkspaceMigrationRunnerException) {
    return (
      error.code ===
      WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS
    );
  }

  if (error instanceof LogicFunctionException) {
    return !LOGIC_FUNCTION_INFRASTRUCTURE_FAILURE_CODES.includes(error.code);
  }

  if (error instanceof TwentyOrmException) {
    return isTwentyOrmUserInputError(error);
  }

  return (
    error instanceof CustomException &&
    error.code !== CommonExceptionCode.INTERNAL_SERVER_ERROR
  );
};
