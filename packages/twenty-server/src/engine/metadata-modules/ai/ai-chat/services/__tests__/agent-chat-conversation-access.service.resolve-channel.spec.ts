import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildAgentRunStreamChannelId } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-stream-channel-id.util';
import { AgentChatConversationAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-conversation-access.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE = {
  id: 'workspace-id',
  workspaceCustomApplicationId: 'workspace-custom-application-id',
};
const RUN_ID = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';
const buildApplication = (id: string) => ({
  id,
  universalIdentifier: `${id}-universal-identifier`,
  sourceType: ApplicationRegistrationSourceType.NPM,
});

const buildService = () => {
  const agentRunService = {
    resolveConversationThreadIdOrThrow: jest
      .fn()
      .mockResolvedValue('conversation-thread-id'),
  };

  return {
    service: new AgentChatConversationAccessService(
      {} as never,
      agentRunService as never,
      {} as never,
    ),
    agentRunService,
  };
};

describe('AgentChatConversationAccessService.resolveReadableChannelIdOrThrow', () => {
  it('names the channel of a run by the caller application and the run id', async () => {
    const { service } = buildService();

    await expect(
      service.resolveReadableChannelIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: buildApplication('application-a'),
        workspaceMemberId: undefined,
        source: { runId: RUN_ID },
      }),
    ).resolves.toBe(
      buildAgentRunStreamChannelId({
        applicationId: 'application-a',
        runId: RUN_ID,
      }),
    );
  });

  it('gives another application naming the same run another channel', async () => {
    const { service } = buildService();
    const resolveFor = (applicationId: string) =>
      service.resolveReadableChannelIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: buildApplication(applicationId),
        workspaceMemberId: undefined,
        source: { runId: RUN_ID },
      });

    expect(await resolveFor('application-b')).not.toBe(
      await resolveFor('application-a'),
    );
  });

  it('refuses a run id without an application token', async () => {
    const { service } = buildService();

    await expect(
      service.resolveReadableChannelIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: undefined,
        workspaceMemberId: 'workspace-member-id',
        source: { runId: RUN_ID },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });

  it('refuses a run id together with a conversation', async () => {
    const { service } = buildService();

    await expect(
      service.resolveReadableChannelIdOrThrow({
        workspace: WORKSPACE,
        callerApplication: buildApplication('application-a'),
        workspaceMemberId: undefined,
        source: {
          runId: RUN_ID,
          agentUniversalIdentifier: 'agent-universal-identifier',
          threadKey: 'deal-42',
        },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AGENT_INPUT });
  });

  it('resolves a conversation as before when no run id is given', async () => {
    const { service, agentRunService } = buildService();
    const callerApplication = buildApplication('application-a');

    await expect(
      service.resolveReadableChannelIdOrThrow({
        workspace: WORKSPACE,
        callerApplication,
        workspaceMemberId: undefined,
        source: {
          runId: null,
          agentUniversalIdentifier: 'agent-universal-identifier',
          threadKey: 'deal-42',
        },
      }),
    ).resolves.toBe('conversation-thread-id');
    expect(
      agentRunService.resolveConversationThreadIdOrThrow,
    ).toHaveBeenCalledWith({
      workspace: WORKSPACE,
      callerApplication,
      agentUniversalIdentifier: 'agent-universal-identifier',
      threadKey: 'deal-42',
    });
  });
});
