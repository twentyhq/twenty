import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

const JOB_DATA = {
  workspaceId: 'workspace-id',
  agentId: 'agent-id',
  triggerId: 'trigger-id',
  payload: {},
} as RunAgentTriggerJobData;

describe('RunAgentTriggerJob', () => {
  it('runs the trigger inside its workspace context with system auth', async () => {
    let isInWorkspaceContext = false;

    const agentTriggerRunnerService = {
      run: jest.fn(async () => {
        expect(isInWorkspaceContext).toBe(true);
      }),
    };
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(async (work: () => Promise<void>) => {
        isInWorkspaceContext = true;
        await work();
        isInWorkspaceContext = false;
      }),
    };

    await new RunAgentTriggerJob(
      agentTriggerRunnerService as never,
      workspaceOrmManager as never,
    ).handle(JOB_DATA);

    expect(agentTriggerRunnerService.run).toHaveBeenCalledWith(JOB_DATA);
    expect(workspaceOrmManager.executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
      buildSystemAuthContext('workspace-id'),
    );
  });
});
