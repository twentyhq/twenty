import { Test, type TestingModule } from '@nestjs/testing';

import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { CreateInboxItemTool } from 'src/engine/core-modules/tool/tools/inbox-tool/create-inbox-item-tool';

const WORKSPACE_ID = 'workspace-id';
const QUEUE_ID = 'queue-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

describe('CreateInboxItemTool', () => {
  let tool: CreateInboxItemTool;

  const inboxRouterService = { routeOrThrow: jest.fn() };
  const inboxQueueService = {
    toUserWorkspaceIds: jest.fn(),
    findQueueOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    inboxRouterService.routeOrThrow.mockResolvedValue({
      id: 'inbox-item-id',
      title: 'Approve the discount',
      queueId: QUEUE_ID,
      assigneeUserWorkspaceId: null,
    });
    inboxQueueService.toUserWorkspaceIds.mockResolvedValue([USER_WORKSPACE_ID]);
    inboxQueueService.findQueueOrThrow.mockResolvedValue({ id: QUEUE_ID });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInboxItemTool,
        { provide: InboxRouterService, useValue: inboxRouterService },
        { provide: InboxQueueService, useValue: inboxQueueService },
      ],
    }).compile();

    tool = module.get<CreateInboxItemTool>(CreateInboxItemTool);
  });

  it('should route by the workspace settings when nothing named a recipient', async () => {
    // Act
    const output = await tool.execute(
      { title: 'Approve the discount', typeKey: 'approval' },
      { workspaceId: WORKSPACE_ID },
    );

    // Assert
    expect(output.success).toBe(true);
    expect(inboxRouterService.routeOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        typeKey: 'approval',
        target: undefined,
      }),
    );
  });

  // Callers name a workspace member because that is the identity they can see
  it('should translate a workspace member into the user workspace the inbox addresses', async () => {
    // Act
    await tool.execute(
      {
        title: 'Approve the discount',
        typeKey: 'approval',
        assigneeWorkspaceMemberId: WORKSPACE_MEMBER_ID,
      },
      { workspaceId: WORKSPACE_ID },
    );

    // Assert
    expect(inboxRouterService.routeOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { kind: 'userWorkspace', userWorkspaceId: USER_WORKSPACE_ID },
      }),
    );
  });

  // Work addressed to one person landing in a shared inbox is worse than failing
  it('should fail rather than fall back when the named person is not a member', async () => {
    // Prepare
    inboxQueueService.toUserWorkspaceIds.mockResolvedValue([]);

    // Act
    const output = await tool.execute(
      {
        title: 'Approve the discount',
        typeKey: 'approval',
        assigneeWorkspaceMemberId: 'someone-elses-workspace-member-id',
      },
      { workspaceId: WORKSPACE_ID },
    );

    // Assert
    expect(output.success).toBe(false);
    expect(inboxRouterService.routeOrThrow).not.toHaveBeenCalled();
  });

  // The queue lookup is workspace-scoped, so a foreign queue never becomes an address
  it('should reject a shared inbox that does not belong to this workspace', async () => {
    // Prepare
    inboxQueueService.findQueueOrThrow.mockRejectedValue(
      new InboxException(
        'Inbox queue not found',
        InboxExceptionCode.UNKNOWN_INBOX_QUEUE,
      ),
    );

    // Act
    const output = await tool.execute(
      {
        title: 'Approve the discount',
        typeKey: 'approval',
        queueId: 'someone-elses-queue-id',
      },
      { workspaceId: WORKSPACE_ID },
    );

    // Assert
    expect(output.success).toBe(false);
    expect(inboxRouterService.routeOrThrow).not.toHaveBeenCalled();
  });

  it('should report the failure rather than swallow it when the inbox is disabled', async () => {
    // Prepare
    inboxRouterService.routeOrThrow.mockRejectedValue(
      new InboxException(
        'The inbox is not enabled for this workspace',
        InboxExceptionCode.INBOX_DISABLED,
      ),
    );

    // Act
    const output = await tool.execute(
      { title: 'Approve the discount', typeKey: 'approval' },
      { workspaceId: WORKSPACE_ID },
    );

    // Assert
    expect(output.success).toBe(false);
    expect(output.error).toContain('not enabled');
  });
});
