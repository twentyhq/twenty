import { Test, type TestingModule } from '@nestjs/testing';

import { InboxToolCallExecutionService } from 'src/engine/core-modules/inbox/services/inbox-tool-call-execution.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';

const WORKSPACE_ID = 'workspace-id';
const ACTOR_USER_WORKSPACE_ID = 'approver-user-workspace-id';

describe('InboxToolCallExecutionService', () => {
  let service: InboxToolCallExecutionService;

  const toolRegistryService = { resolveAndExecute: jest.fn() };
  const agentActorContextService = {
    buildUserAndAgentActorContext: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    agentActorContextService.buildUserAndAgentActorContext.mockResolvedValue({
      actorContext: { source: 'MANUAL' },
      roleId: 'approver-role-id',
      userId: 'approver-user-id',
      userWorkspaceId: ACTOR_USER_WORKSPACE_ID,
      userContext: { locale: 'en' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxToolCallExecutionService,
        { provide: ToolRegistryService, useValue: toolRegistryService },
        {
          provide: AgentActorContextService,
          useValue: agentActorContextService,
        },
      ],
    }).compile();

    service = module.get<InboxToolCallExecutionService>(
      InboxToolCallExecutionService,
    );
  });

  const execute = () =>
    service.execute({
      workspaceId: WORKSPACE_ID,
      actorUserWorkspaceId: ACTOR_USER_WORKSPACE_ID,
      toolName: 'send_email',
      input: { recipients: { to: 'marie@google.com' }, subject: 'Hello' },
    });

  it('runs with the approver role rather than whoever proposed the call', async () => {
    toolRegistryService.resolveAndExecute.mockResolvedValue({
      success: true,
      message: 'Draft created',
    });

    await execute();

    expect(
      agentActorContextService.buildUserAndAgentActorContext,
    ).toHaveBeenCalledWith(ACTOR_USER_WORKSPACE_ID, WORKSPACE_ID);
    expect(toolRegistryService.resolveAndExecute).toHaveBeenCalledWith(
      'send_email',
      { recipients: { to: 'marie@google.com' }, subject: 'Hello' },
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        roleId: 'approver-role-id',
        userWorkspaceId: ACTOR_USER_WORKSPACE_ID,
      }),
      expect.anything(),
    );
  });

  it('keeps what the tool returned so the person can see what happened', async () => {
    toolRegistryService.resolveAndExecute.mockResolvedValue({
      success: true,
      message: 'Draft created',
      result: { draftId: 'draft-id' },
      warnings: ['No cc was set'],
    });

    await expect(execute()).resolves.toEqual({
      status: 'EXECUTED',
      output: {
        message: 'Draft created',
        result: { draftId: 'draft-id' },
        warnings: ['No cc was set'],
      },
    });
  });

  it('reports an unsuccessful output as a failed call rather than a done one', async () => {
    toolRegistryService.resolveAndExecute.mockResolvedValue({
      success: false,
      message: 'Tool "invent_a_tool" not found',
      error: 'Tool "invent_a_tool" not found. Did you mean: create_one_task?',
    });

    await expect(execute()).resolves.toEqual({
      status: 'FAILED',
      error: 'Tool "invent_a_tool" not found. Did you mean: create_one_task?',
    });
  });

  it('falls back to the message when the failure carries no error', async () => {
    toolRegistryService.resolveAndExecute.mockResolvedValue({
      success: false,
      message: 'Could not reach the mailbox',
    });

    await expect(execute()).resolves.toEqual({
      status: 'FAILED',
      error: 'Could not reach the mailbox',
    });
  });

  // A failed call the person cannot read anything off is one they cannot act
  // on, so the row always carries something naming the tool.
  it('names the tool when the failure reports no reason at all', async () => {
    toolRegistryService.resolveAndExecute.mockResolvedValue({
      success: false,
      message: '',
    });

    await expect(execute()).resolves.toEqual({
      status: 'FAILED',
      error: 'Tool send_email failed without reporting a reason',
    });
  });
});
