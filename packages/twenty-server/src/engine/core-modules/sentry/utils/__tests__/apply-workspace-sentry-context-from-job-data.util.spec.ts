import * as Sentry from '@sentry/node';

import { applyWorkspaceSentryContextFromJobData } from 'src/engine/core-modules/sentry/utils/apply-workspace-sentry-context-from-job-data.util';

jest.mock('@sentry/node', () => ({
  setTag: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
}));

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const WORKFLOW_RUN_ID = '3591972b-279c-4559-bbce-748534778852';

describe('applyWorkspaceSentryContextFromJobData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('identifies the workflow run a job belongs to', () => {
    applyWorkspaceSentryContextFromJobData({
      workspaceId: WORKSPACE_ID,
      workflowRunId: WORKFLOW_RUN_ID,
    });

    expect(Sentry.setTag).toHaveBeenCalledWith(
      'twenty.workflow_run.id',
      WORKFLOW_RUN_ID,
    );
    expect(Sentry.setContext).toHaveBeenCalledWith('twenty', {
      workspace_id: WORKSPACE_ID,
      workflow_run_id: WORKFLOW_RUN_ID,
    });
  });

  it('leaves a job that belongs to no workflow run unlabelled', () => {
    applyWorkspaceSentryContextFromJobData({
      workspaceId: WORKSPACE_ID,
      workflowId: 'a-workflow-that-has-not-run-yet',
    });

    expect(Sentry.setTag).not.toHaveBeenCalledWith(
      'twenty.workflow_run.id',
      expect.anything(),
    );
    expect(Sentry.setContext).toHaveBeenCalledWith('twenty', {
      workspace_id: WORKSPACE_ID,
    });
  });

  it('still identifies the workspace of a job that has no workflow run', () => {
    applyWorkspaceSentryContextFromJobData({ workspaceId: WORKSPACE_ID });

    expect(Sentry.setTag).toHaveBeenCalledWith(
      'twenty.workspace.id',
      WORKSPACE_ID,
    );
  });

  it.each([
    ['no data at all', undefined],
    ['data that is not an object', 'workflow-run'],
    ['no workspace', { workflowRunId: WORKFLOW_RUN_ID }],
  ])('identifies nothing for a job with %s', (_, jobData) => {
    applyWorkspaceSentryContextFromJobData(jobData);

    expect(Sentry.setTag).not.toHaveBeenCalled();
    expect(Sentry.setContext).not.toHaveBeenCalled();
  });
});
