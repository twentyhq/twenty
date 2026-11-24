import { buildLogicFunctionJobFailureHandlerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-logic-function-job-failure-handler-job.util';

describe('buildLogicFunctionJobFailureHandlerJob', () => {
  it('should run the onJobFailure export of the failed function with the original payload and error', () => {
    expect(
      buildLogicFunctionJobFailureHandlerJob({
        failedLogicFunctionPayload: {
          logicFunctionId: 'logic-function-id',
          workspaceId: 'workspace-id',
          payload: { slackMessageTimestamp: '1700000000.000100' },
          userId: 'user-id',
          userWorkspaceId: 'user-workspace-id',
        },
        jobFailureHandlerName: 'default.config.onJobFailure',
        applicationUniversalIdentifier: 'application-universal-identifier',
        queueJobId: 'workspace-id.job-id',
        attemptsMade: 1,
        error: {
          type: 'TimeoutError',
          message: 'Function execution timed out after 240s',
        },
      }),
    ).toEqual({
      data: {
        logicFunctionId: 'logic-function-id',
        workspaceId: 'workspace-id',
        payload: {
          payload: { slackMessageTimestamp: '1700000000.000100' },
          error: {
            type: 'TimeoutError',
            message: 'Function execution timed out after 240s',
          },
          job: { id: 'job-id', attemptsMade: 1 },
        },
        userId: 'user-id',
        userWorkspaceId: 'user-workspace-id',
        jobFailureHandlerName: 'default.config.onJobFailure',
      },
      jobId: 'workspace-id.job-id.on-failure',
      workspaceId: 'workspace-id',
      applicationUniversalIdentifier: 'application-universal-identifier',
    });
  });

  it('should keep a platform job id as is and default a missing payload', () => {
    const { data, jobId } = buildLogicFunctionJobFailureHandlerJob({
      failedLogicFunctionPayload: {
        logicFunctionId: 'logic-function-id',
        workspaceId: 'workspace-id',
      },
      jobFailureHandlerName: 'default.config.onJobFailure',
      applicationUniversalIdentifier: 'application-universal-identifier',
      queueJobId: '42',
      attemptsMade: 3,
      error: { type: 'Error', message: 'boom' },
    });

    expect(jobId).toBe('42.on-failure');
    expect(data.payload).toEqual({
      payload: {},
      error: { type: 'Error', message: 'boom' },
      job: { id: '42', attemptsMade: 3 },
    });
  });
});
