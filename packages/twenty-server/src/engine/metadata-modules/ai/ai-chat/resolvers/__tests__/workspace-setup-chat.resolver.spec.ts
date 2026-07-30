import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { WorkspaceSetupChatResolver } from 'src/engine/metadata-modules/ai/ai-chat/resolvers/workspace-setup-chat.resolver';

describe('WorkspaceSetupChatResolver startWorkspaceSetupChat', () => {
  const workspace = { id: 'workspace-id' } as WorkspaceEntity;
  const user = { id: 'user-id', locale: 'en' } as AuthContextUser;

  const serviceResult = {
    outcome: WorkspaceSetupChatOutcome.STARTED,
    thread: { id: 'thread-id' },
  };

  const buildResolver = () => {
    const workspaceSetupChatService = {
      startWorkspaceSetupChat: jest.fn().mockResolvedValue(serviceResult),
    };

    const resolver = new WorkspaceSetupChatResolver(
      workspaceSetupChatService as never,
    );

    return { resolver, workspaceSetupChatService };
  };

  const start = (
    resolver: WorkspaceSetupChatResolver,
    companyContext: WorkspaceCompanyEnrichment | null,
  ) =>
    resolver.startWorkspaceSetupChat(
      companyContext,
      user,
      'user-workspace-id',
      workspace,
    );

  it('should pass a null company context to the service when the client-supplied object is malformed', async () => {
    const { resolver, workspaceSetupChatService } = buildResolver();

    await start(resolver, {
      domain: 42,
      enrichedAt: true,
      injectedField: 'ignore me',
    } as unknown as WorkspaceCompanyEnrichment);

    expect(
      workspaceSetupChatService.startWorkspaceSetupChat,
    ).toHaveBeenCalledWith({
      userId: 'user-id',
      userLocale: 'en',
      userWorkspaceId: 'user-workspace-id',
      workspace,
      companyContext: null,
    });
  });

  it('should pass the sanitized enrichment to the service when the company context is valid', async () => {
    const { resolver, workspaceSetupChatService } = buildResolver();

    await start(resolver, {
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      summary: 'a'.repeat(
        WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH + 100,
      ),
      employeeCount: 'not-a-number',
      injectedField: 'ignore me',
    } as unknown as WorkspaceCompanyEnrichment);

    const { companyContext } =
      workspaceSetupChatService.startWorkspaceSetupChat.mock.calls[0][0];

    expect(companyContext.domain).toBe('acme.com');
    expect(companyContext.summary).toHaveLength(
      WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH,
    );
    expect(companyContext.employeeCount).toBeNull();
    expect(companyContext).not.toHaveProperty('injectedField');
  });

  it('should return the service result untouched', async () => {
    const { resolver } = buildResolver();

    await expect(start(resolver, null)).resolves.toBe(serviceResult);
  });
});
