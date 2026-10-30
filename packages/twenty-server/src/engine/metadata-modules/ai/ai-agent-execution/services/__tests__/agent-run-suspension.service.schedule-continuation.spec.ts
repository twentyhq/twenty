import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';

const WORKSPACE_ID = 'workspace-id';

const buildService = (wakeUp: object | null) => {
  const messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };
  const agentRunJobScopeService = {
    resolve: jest.fn(async ({ agentId }: { agentId: string }) => ({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: `application-of-${agentId}`,
    })),
  };

  const service = new AgentRunSuspensionService(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    { find: jest.fn().mockResolvedValue(wakeUp) } as never,
    {} as never,
    agentRunJobScopeService as never,
    messageQueueService as never,
  );

  return { service, messageQueueService };
};

const jobData = {
  workspaceId: WORKSPACE_ID,
  threadId: 'thread-id',
  wakeUpId: 'wake-up-id',
  outcome: { type: 'MESSAGE_RECEIVED' as const },
};

describe('AgentRunSuspensionService scheduleContinuation', () => {
  it("keeps the suspended agent's application scope on the continuation", async () => {
    const { service, messageQueueService } = buildService({
      payload: { runSpec: { agentId: 'agent-a' } },
    });

    await service.scheduleContinuation(jobData);

    expect(messageQueueService.add).toHaveBeenCalledWith(
      CONTINUE_AGENT_RUN_JOB_NAME,
      jobData,
      {
        deduplication: { id: 'continue-agent-run-wake-up-id' },
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: 'application-of-agent-a',
      },
    );
  });

  it('uses a workspace scope once the wake-up is gone', async () => {
    const { service, messageQueueService } = buildService(null);

    await service.scheduleContinuation(jobData);

    expect(messageQueueService.add).toHaveBeenCalledWith(
      CONTINUE_AGENT_RUN_JOB_NAME,
      jobData,
      {
        deduplication: { id: 'continue-agent-run-wake-up-id' },
        workspaceId: WORKSPACE_ID,
        isWorkspaceJob: true,
      },
    );
  });
});
