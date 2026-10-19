import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { buildLogicFunctionRunMetricEvent } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-logic-function-run-metric-event.util';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const flatApplication = {
  id: 'application-1',
  applicationRegistrationId: 'registration-1',
  version: '1.2.3',
} as FlatApplication;

const flatLogicFunction = {
  id: 'function-1',
  name: 'syncContacts',
} as FlatLogicFunction;

describe('buildLogicFunctionRunMetricEvent', () => {
  it('counts a successful run with its duration', () => {
    expect(
      buildLogicFunctionRunMetricEvent({
        result: {
          data: null,
          logs: '',
          duration: 420,
          billedDurationMs: 420,
          status: LogicFunctionExecutionStatus.SUCCESS,
        },
        flatApplication,
        flatLogicFunction,
        workspaceId: 'workspace-1',
      }),
    ).toMatchObject({
      applicationRegistrationId: 'registration-1',
      workspaceId: 'workspace-1',
      applicationId: 'application-1',
      applicationVersion: '1.2.3',
      source: 'LOGIC_FUNCTION',
      logicFunctionId: 'function-1',
      logicFunctionName: 'syncContacts',
      level: 'INFO',
      errorCode: '',
      durationMs: 420,
    });
  });

  it('counts a failed run with its error type', () => {
    expect(
      buildLogicFunctionRunMetricEvent({
        result: {
          data: null,
          logs: '',
          duration: 30_000,
          billedDurationMs: 30_000,
          status: LogicFunctionExecutionStatus.ERROR,
          error: {
            errorType: 'TimeoutError',
            errorMessage: 'Function execution timed out after 30s',
            stackTrace: [],
          },
        },
        flatApplication,
        flatLogicFunction,
        workspaceId: 'workspace-1',
      }),
    ).toMatchObject({ level: 'ERROR', errorCode: 'TimeoutError' });
  });
});
