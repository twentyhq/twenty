import { buildLogicFunctionFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-logic-function-failure-handler-job.util';

const FAILED_LOGIC_FUNCTION_PAYLOAD = {
  logicFunctionId: 'failed-function-id',
  workspaceId: 'workspace-id',
  payload: { slackMessageTimestamp: '1700000000.000100' },
  userId: 'user-id',
  userWorkspaceId: 'user-workspace-id',
};

const FAILED_FLAT_LOGIC_FUNCTION = {
  universalIdentifier: 'failed-function',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
};

const FAILURE_HANDLER = {
  id: 'failure-handler-id',
  applicationId: 'application-id',
  deletedAt: null,
};

const ERROR = {
  errorType: 'TimeoutError',
  errorMessage: 'Function execution timed out after 240s',
};

describe('buildLogicFunctionFailureHandlerJob', () => {
  it('should run the handler with the original payload and error', () => {
    expect(
      buildLogicFunctionFailureHandlerJob({
        failedLogicFunctionPayload: FAILED_LOGIC_FUNCTION_PAYLOAD,
        failedFlatLogicFunction: FAILED_FLAT_LOGIC_FUNCTION,
        failureHandler: FAILURE_HANDLER,
        error: ERROR,
      }),
    ).toEqual({
      jobData: {
        logicFunctionId: FAILURE_HANDLER.id,
        workspaceId: FAILED_LOGIC_FUNCTION_PAYLOAD.workspaceId,
        payload: {
          failedLogicFunctionUniversalIdentifier:
            FAILED_FLAT_LOGIC_FUNCTION.universalIdentifier,
          payload: FAILED_LOGIC_FUNCTION_PAYLOAD.payload,
          error: ERROR,
        },
        userId: FAILED_LOGIC_FUNCTION_PAYLOAD.userId,
        userWorkspaceId: FAILED_LOGIC_FUNCTION_PAYLOAD.userWorkspaceId,
        isFailureHandlerRun: true,
      },
      applicationUniversalIdentifier:
        FAILED_FLAT_LOGIC_FUNCTION.applicationUniversalIdentifier,
    });
  });

  it('should skip a handler that no longer exists', () => {
    expect(
      buildLogicFunctionFailureHandlerJob({
        failedLogicFunctionPayload: FAILED_LOGIC_FUNCTION_PAYLOAD,
        failedFlatLogicFunction: FAILED_FLAT_LOGIC_FUNCTION,
        failureHandler: undefined,
        error: ERROR,
      }),
    ).toBeUndefined();
  });

  it('should skip a deleted handler', () => {
    expect(
      buildLogicFunctionFailureHandlerJob({
        failedLogicFunctionPayload: FAILED_LOGIC_FUNCTION_PAYLOAD,
        failedFlatLogicFunction: FAILED_FLAT_LOGIC_FUNCTION,
        failureHandler: {
          ...FAILURE_HANDLER,
          deletedAt: '2026-01-01T00:00:00.000Z',
        },
        error: ERROR,
      }),
    ).toBeUndefined();
  });

  it('should skip a handler of another application', () => {
    expect(
      buildLogicFunctionFailureHandlerJob({
        failedLogicFunctionPayload: FAILED_LOGIC_FUNCTION_PAYLOAD,
        failedFlatLogicFunction: FAILED_FLAT_LOGIC_FUNCTION,
        failureHandler: {
          ...FAILURE_HANDLER,
          applicationId: 'other-application-id',
        },
        error: ERROR,
      }),
    ).toBeUndefined();
  });
});
