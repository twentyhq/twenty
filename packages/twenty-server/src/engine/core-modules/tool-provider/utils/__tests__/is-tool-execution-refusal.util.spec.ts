import { msg } from '@lingui/core/macro';

import { isToolExecutionRefusal } from 'src/engine/core-modules/tool-provider/utils/is-tool-execution-refusal.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { UnknownException } from 'src/utils/custom-exception';

describe('isToolExecutionRefusal', () => {
  it.each([
    [
      'a metadata validation failure',
      new WorkspaceMigrationBuilderException({} as never),
      true,
    ],
    [
      'a migration blocked by deferred actions',
      new WorkspaceMigrationRunnerException({
        message: 'Deferred actions in progress',
        code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
      }),
      true,
    ],
    [
      'a disabled logic function',
      new LogicFunctionException(
        'Disabled',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      ),
      true,
    ],
    [
      'a domain exception such as a missing record',
      new UnknownException('View not found', 'VIEW_NOT_FOUND', {
        userFriendlyMessage: msg`View not found`,
      }),
      true,
    ],
    [
      'a logic function infrastructure failure',
      new LogicFunctionException(
        'Failed to get SDK layer',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_LAYER_BUILD_FAILED,
      ),
      false,
    ],
    [
      'a domain exception flagged as an internal error',
      new UnknownException('Unexpected state', 'INTERNAL_SERVER_ERROR', {
        userFriendlyMessage: msg`Unexpected state`,
      }),
      false,
    ],
    [
      'a database input error',
      new TwentyOrmException(
        'Unknown column',
        TwentyOrmExceptionCode.UNKNOWN_COLUMN,
      ),
      true,
    ],
    [
      'a database read timeout',
      new TwentyOrmException(
        'Query read timeout',
        TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
      ),
      false,
    ],
    ['a plain runtime error', new TypeError('records is not iterable'), false],
  ])('should classify %s', (_, error, isRefusal) => {
    expect(isToolExecutionRefusal(error)).toBe(isRefusal);
  });
});
