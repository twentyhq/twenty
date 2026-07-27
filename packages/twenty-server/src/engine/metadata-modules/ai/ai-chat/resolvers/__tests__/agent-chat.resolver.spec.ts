import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/agent-chat.resolver';

describe('AgentChatResolver sendChatMessage companyContext sanitization', () => {
  const workspace = {
    id: 'workspace-id',
    smartModel: 'model-id',
  } as WorkspaceEntity;

  const buildResolver = () => {
    const agentChatStreamingService = {
      streamAgentChat: jest.fn().mockResolvedValue({
        queued: false,
        streamId: 'stream-id',
        messageId: 'message-id',
        turnId: 'turn-id',
      }),
    };
    const threadRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'thread-id',
        deletedAt: null,
        activeStreamId: null,
        pendingQuestionMessageId: null,
      }),
    };
    const aiModelRegistryService = {
      getAvailableModels: jest.fn().mockReturnValue([{ modelId: 'model-id' }]),
      validateModelAvailability: jest.fn(),
    };
    const billingUsageService = {
      hasAvailableCreditsOrThrow: jest.fn().mockResolvedValue(undefined),
    };

    const resolver = new AgentChatResolver(
      {} as never,
      agentChatStreamingService as never,
      {} as never,
      {} as never,
      billingUsageService as never,
      aiModelRegistryService as never,
      {} as never,
      threadRepository as never,
    );

    return { resolver, agentChatStreamingService };
  };

  const sendMessage = (
    resolver: AgentChatResolver,
    companyContext: WorkspaceCompanyEnrichment | null,
  ) =>
    resolver.sendChatMessage(
      'thread-id',
      'hello',
      'message-id',
      null,
      companyContext,
      undefined,
      null,
      'user-workspace-id',
      workspace,
    );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sanitizes the client-supplied company context before streaming', async () => {
    const { resolver, agentChatStreamingService } = buildResolver();

    await sendMessage(resolver, {
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      summary: 'a'.repeat(
        WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH + 100,
      ),
      employeeCount: 'not-a-number',
      injectedField: 'ignore me',
    } as unknown as WorkspaceCompanyEnrichment);

    const { companyContext } =
      agentChatStreamingService.streamAgentChat.mock.calls[0][0];

    expect(companyContext.domain).toBe('acme.com');
    expect(companyContext.summary).toHaveLength(
      WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH,
    );
    expect(companyContext.employeeCount).toBeNull();
    expect(companyContext).not.toHaveProperty('injectedField');
  });

  it('forwards null for a non-object company context', async () => {
    const { resolver, agentChatStreamingService } = buildResolver();

    await sendMessage(
      resolver,
      'not-an-object' as unknown as WorkspaceCompanyEnrichment,
    );

    expect(agentChatStreamingService.streamAgentChat).toHaveBeenCalledWith(
      expect.objectContaining({ companyContext: null }),
    );
  });
});
