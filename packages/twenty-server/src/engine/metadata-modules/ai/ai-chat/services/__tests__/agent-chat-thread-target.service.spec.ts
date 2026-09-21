import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const THREAD_ID = '20202020-0000-4000-8000-000000000002';
const OTHER_THREAD_ID = '20202020-0000-4000-8000-000000000003';
const UNATTACHED_THREAD_ID = '20202020-0000-4000-8000-000000000006';
const RECORD_ID = '20202020-0000-4000-8000-000000000004';
const COMPANY_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000005';
const OWNER_ID = 'owner';
const OTHER_MEMBER_ID = 'other-member';

const args = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: OWNER_ID,
  threadId: THREAD_ID,
  objectNameSingular: 'company',
  recordId: RECORD_ID,
};

const buildService = () => {
  const threads = [
    { id: THREAD_ID, userWorkspaceId: OWNER_ID },
    // Owned by the reader but attached to no record, so it must never surface
    // through a record lookup.
    { id: UNATTACHED_THREAD_ID, userWorkspaceId: OWNER_ID },
  ];

  const threadRepository = {
    find: jest.fn().mockImplementation(async (_workspaceId, { where }) => {
      // `In(...)` is a FindOperator here; read the ids it carries.
      const requestedThreadIds: string[] = where.id._value;

      return threads.filter(
        (thread) =>
          thread.userWorkspaceId === where.userWorkspaceId &&
          requestedThreadIds.includes(thread.id),
      );
    }),
    findOne: jest.fn().mockImplementation(async (_workspaceId, { where }) => {
      return (
        threads.find(
          (thread) =>
            thread.id === where.id &&
            thread.userWorkspaceId === where.userWorkspaceId,
        ) ?? null
      );
    }),
  };

  const targetRepository = {
    insert: jest.fn(),
    delete: jest.fn(),
    find: jest.fn().mockResolvedValue([]),
  };

  const storage = { storage: 'workspace' as 'workspace' | 'core' };

  const agentHistoryStorageService = {
    run: jest
      .fn()
      .mockImplementation(
        (_workspaceId: string, work: (context: unknown) => Promise<unknown>) =>
          work({ storage: storage.storage }),
      ),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((work: () => Promise<unknown>) => work()),
    getRepository: jest.fn().mockReturnValue(targetRepository),
  };

  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          company: {
            id: COMPANY_OBJECT_METADATA_ID,
            nameSingular: 'company',
            namePlural: 'companies',
          },
        },
      },
    }),
  };

  return {
    service: new AgentChatThreadTargetService(
      threadRepository as never,
      agentHistoryStorageService as never,
      workspaceOrmManager as never,
      workspaceCacheService as never,
    ),
    targetRepository,
    threadRepository,
    storage,
    threads,
  };
};

describe('Attaching a conversation to a record', () => {
  it('stores the link against the resolved object metadata', async () => {
    const { service, targetRepository } = buildService();

    await service.attachThreadToRecord(args);

    expect(targetRepository.insert).toHaveBeenCalledWith(
      {
        threadId: THREAD_ID,
        objectMetadataId: COMPANY_OBJECT_METADATA_ID,
        recordId: RECORD_ID,
      },
      { onConflictDoNothing: true },
    );
  });

  it('refuses to attach a conversation the member does not own', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({
        ...args,
        userWorkspaceId: OTHER_MEMBER_ID,
      }),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  it('rejects an object name the workspace does not have', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({ ...args, objectNameSingular: 'unicorn' }),
    ).rejects.toMatchObject({ code: 'INVALID_AGENT_INPUT' });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  it('refuses while the workspace history still routes to core', async () => {
    const { service, targetRepository, storage } = buildService();

    storage.storage = 'core';

    await expect(service.attachThreadToRecord(args)).rejects.toMatchObject({
      code: 'INVALID_AGENT_INPUT',
    });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  it('removes only the link it was asked to remove', async () => {
    const { service, targetRepository } = buildService();

    await service.detachThreadFromRecord(args);

    expect(targetRepository.delete).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      objectMetadataId: COMPANY_OBJECT_METADATA_ID,
      recordId: RECORD_ID,
    });
  });
});

describe('Listing the conversations attached to a record', () => {
  it('returns nothing when the record carries no link', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.findThreadIdsAttachedToRecord({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OWNER_ID,
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toEqual([]);

    expect(targetRepository.find).toHaveBeenCalledWith({
      where: {
        objectMetadataId: COMPANY_OBJECT_METADATA_ID,
        recordId: RECORD_ID,
      },
    });
  });

  it('hides a linked conversation the member cannot read', async () => {
    const { service, targetRepository } = buildService();

    targetRepository.find.mockResolvedValue([
      { threadId: THREAD_ID },
      { threadId: OTHER_THREAD_ID },
    ]);

    await expect(
      service.findThreadIdsAttachedToRecord({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OWNER_ID,
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toEqual([THREAD_ID]);
  });

  it('leaves out a readable conversation that is not attached to the record', async () => {
    const { service, targetRepository } = buildService();

    targetRepository.find.mockResolvedValue([{ threadId: THREAD_ID }]);

    await expect(
      service.findThreadIdsAttachedToRecord({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OWNER_ID,
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toEqual([THREAD_ID]);
  });

  it('hides every linked conversation from a member who owns none', async () => {
    const { service, targetRepository } = buildService();

    targetRepository.find.mockResolvedValue([{ threadId: THREAD_ID }]);

    await expect(
      service.findThreadIdsAttachedToRecord({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: OTHER_MEMBER_ID,
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toEqual([]);
  });
});
