import { buildToolExecutionFailure } from 'src/engine/core-modules/tool-provider/utils/build-tool-execution-failure.util';
import { buildQuotaExhaustedException } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-exception.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

describe('buildToolExecutionFailure', () => {
  it('should report a crash and return its message', () => {
    expect(
      buildToolExecutionFailure({
        error: new TypeError(
          "Cannot read properties of undefined (reading 'id')",
        ),
        toolName: 'find_people',
      }),
    ).toEqual({
      output: {
        success: false,
        message: 'Failed to execute find_people',
        error: "Cannot read properties of undefined (reading 'id')",
      },
      shouldCapture: true,
    });
  });

  it('should return validation errors without reporting them', () => {
    const error = new WorkspaceMigrationBuilderException({
      status: 'fail',
      report: {
        view: [
          {
            errors: [{ code: 'INVALID_NAME', message: 'Name is required' }],
            flatEntityMinimalInformation: { name: 'All people' },
          },
        ],
      },
    } as never);

    expect(
      buildToolExecutionFailure({ error, toolName: 'create_view' }),
    ).toEqual({
      output: {
        success: false,
        message: 'Failed to execute create_view',
        error: 'Validation errors:\n[view] Name is required (All people)',
      },
      shouldCapture: false,
    });
  });

  it('should tell the model a tool ran out of credits without blaming the chat', () => {
    const error = buildQuotaExhaustedException({
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      limitKind: 'quota',
      exhaustedKind: 'allowance',
      spenderType: 'workspace',
      spenderId: null,
      operationType: UsageOperationType.CODE_EXECUTION,
      limitValue: 0,
      remaining: 0,
      periodCount: null,
      periodUnit: null,
      retryAfterMs: 0,
    });

    expect(
      buildToolExecutionFailure({ error, toolName: 'run_app_function' }),
    ).toEqual({
      output: {
        success: false,
        message: 'Failed to execute run_app_function',
        error: 'This tool uses credits and the workspace has none left.',
      },
      shouldCapture: false,
    });
  });

  it('should keep the message of a usage limit a member reached', () => {
    const error = buildQuotaExhaustedException({
      resourceType: UsageResourceType.LOGIC_FUNCTION,
      limitKind: 'quota',
      exhaustedKind: 'limit',
      spenderType: 'userWorkspace',
      spenderId: 'user-workspace-id',
      operationType: UsageOperationType.CODE_EXECUTION,
      limitValue: 10,
      remaining: 0,
      periodCount: 1,
      periodUnit: 'month',
      retryAfterMs: 0,
    });

    expect(
      buildToolExecutionFailure({ error, toolName: 'run_app_function' }).output
        .error,
    ).toBe('Usage limit reached for userWorkspace');
  });

  it('should report a thrown value that is not an Error', () => {
    expect(
      buildToolExecutionFailure({ error: 'boom', toolName: 'find_people' }),
    ).toEqual({
      output: {
        success: false,
        message: 'Failed to execute find_people',
        error: 'boom',
      },
      shouldCapture: true,
    });
  });
});
