import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AGENT_CHAT_THREAD_TARGET_FLAT_ENTITY_MAPS_MOCK } from 'src/engine/metadata-modules/ai/ai-chat/__mocks__/agent-chat-thread-target-flat-entity-maps.mock';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const THREAD_ID = '20202020-0000-4000-8000-000000000002';
const RECORD_ID = '20202020-0000-4000-8000-000000000004';
const TRASHED_RECORD_ID = '20202020-0000-4000-8000-000000000005';
const UNREADABLE_RECORD_ID = '20202020-0000-4000-8000-000000000008';

const MEMBER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: 'member-user-workspace',
  workspaceMemberId: 'member',
} as unknown as WorkspaceAuthContext;

const args = {
  workspaceId: WORKSPACE_ID,
  threadId: THREAD_ID,
  objectNameSingular: 'company',
  recordId: RECORD_ID,
  authContext: MEMBER_AUTH_CONTEXT,
};

const buildService = () => {
  const targetRepository = {
    existsBy: jest.fn().mockResolvedValue(false),
    insert: jest.fn(),
  };

  // Records the member can read. A trashed record is left out, as a lookup
  // without deleted records leaves it out, and one outside the member's grants
  // is refused by the ORM.
  const readableRecordIds = new Set([RECORD_ID]);

  const recordRepository = {
    findOne: jest.fn().mockImplementation(async ({ where }) => {
      if (where.id === UNREADABLE_RECORD_ID) {
        throw new PermissionsException(
          'denied',
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }

      return readableRecordIds.has(where.id) ? { id: where.id } : null;
    }),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((work: () => Promise<unknown>) => work()),
    getRepositoryWithContextPermissions: jest
      .fn()
      .mockImplementation((objectMetadataName: string) =>
        objectMetadataName === 'agentChatThreadTarget'
          ? targetRepository
          : recordRepository,
      ),
  };

  const workspaceCacheService = {
    getOrRecompute: jest
      .fn()
      .mockResolvedValue(AGENT_CHAT_THREAD_TARGET_FLAT_ENTITY_MAPS_MOCK),
  };

  return {
    service: new AgentChatThreadTargetService(
      workspaceOrmManager as never,
      workspaceCacheService as never,
    ),
    targetRepository,
    recordRepository,
    workspaceOrmManager,
  };
};

describe('Attaching a conversation to a record', () => {
  it('stores the link on the leg of the record object', async () => {
    const { service, targetRepository } = buildService();

    await service.attachThreadToRecord(args);

    expect(targetRepository.insert).toHaveBeenCalledWith(
      { threadId: THREAD_ID, targetCompanyId: RECORD_ID },
      { onConflictDoNothing: true },
    );
  });

  // Custom legs carry no unique index, so a second attach must not add a row.
  it('keeps a single link when the conversation is already attached', async () => {
    const { service, targetRepository } = buildService();

    targetRepository.existsBy.mockResolvedValueOnce(true);

    await service.attachThreadToRecord(args);

    expect(targetRepository.existsBy).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      targetCompanyId: RECORD_ID,
    });
    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  // The ORM refuses a link whose conversation the member cannot edit, as it
  // would through the record API.
  it('writes the link as the member the chat turn runs for', async () => {
    const { service, workspaceOrmManager } = buildService();

    await service.attachThreadToRecord(args);

    expect(workspaceOrmManager.executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
      MEMBER_AUTH_CONTEXT,
    );
    expect(
      workspaceOrmManager.getRepositoryWithContextPermissions,
    ).toHaveBeenCalledWith('agentChatThreadTarget');
  });

  it('reports the refusal of a conversation the member cannot edit', async () => {
    const { service, targetRepository } = buildService();
    const refusal = new PermissionsException(
      'the "agentChatThread" record a "agentChatThreadTarget" is attached to is not writable',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    targetRepository.insert.mockRejectedValueOnce(refusal);

    await expect(service.attachThreadToRecord(args)).rejects.toBe(refusal);
  });

  it('rejects an object name the workspace does not have', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({ ...args, objectNameSingular: 'unicorn' }),
    ).rejects.toMatchObject({
      code: 'INVALID_AGENT_INPUT',
      message: 'Unknown object "unicorn"',
    });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  it('rejects an object the target has no leg for', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({ ...args, objectNameSingular: 'task' }),
    ).rejects.toMatchObject({
      code: 'INVALID_AGENT_INPUT',
      message: 'Conversations cannot be attached to task records',
    });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });
});

describe('Finding the record a conversation is attached to', () => {
  it('reads the record as the member', async () => {
    const { service, recordRepository, workspaceOrmManager } = buildService();

    await service.attachThreadToRecord(args);

    expect(
      workspaceOrmManager.getRepositoryWithContextPermissions,
    ).toHaveBeenCalledWith('company');
    expect(recordRepository.findOne).toHaveBeenCalledWith({
      where: { id: RECORD_ID },
      select: { id: true },
    });
  });

  it('refuses a record that does not exist', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({
        ...args,
        recordId: '20202020-0000-4000-8000-000000000009',
      }),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  it('files nothing under a record in the trash', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({ ...args, recordId: TRASHED_RECORD_ID }),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  // Surfacing the denial would leak that the record exists.
  it('treats a record the member cannot read as one that does not exist', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({ ...args, recordId: UNREADABLE_RECORD_ID }),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });
});
