import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const THREAD_ID = '20202020-0000-4000-8000-000000000002';
const RECORD_ID = '20202020-0000-4000-8000-000000000004';
const COMPANY_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000005';
const TARGET_OBJECT_METADATA_ID = '20202020-0000-4000-8000-000000000007';
const UNREADABLE_RECORD_ID = '20202020-0000-4000-8000-000000000008';
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

  // Records the caller is allowed to read. A record outside their grants is
  // indistinguishable from one that does not exist.
  const readableRecordIds = new Set([RECORD_ID]);

  const recordRepository = {
    findOne: jest
      .fn()
      .mockImplementation(async ({ where }) =>
        readableRecordIds.has(where.id) ? { id: where.id } : null,
      ),
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
    getRepository: jest
      .fn()
      .mockImplementation((objectMetadataName: string) =>
        objectMetadataName === 'agentChatThreadTarget'
          ? targetRepository
          : recordRepository,
      ),
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
          agentChatThreadTarget: {
            id: TARGET_OBJECT_METADATA_ID,
            nameSingular: 'agentChatThreadTarget',
            namePlural: 'agentChatThreadTargets',
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
    recordRepository,
    readableRecordIds,
    workspaceCacheService,
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

describe('Resolving the record a conversation list is scoped to', () => {
  it('returns the object metadata id once the record is readable', async () => {
    const { service } = buildService();

    await expect(
      service.resolveAuthorizedRecordOrThrow({
        workspaceId: WORKSPACE_ID,
        objectNameSingular: 'company',
        recordId: RECORD_ID,
      }),
    ).resolves.toBe(COMPANY_OBJECT_METADATA_ID);
  });

  it('rejects an unknown object', async () => {
    const { service } = buildService();

    await expect(
      service.resolveAuthorizedRecordOrThrow({
        workspaceId: WORKSPACE_ID,
        objectNameSingular: 'unknownObject',
        recordId: RECORD_ID,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_AGENT_INPUT' });
  });

  // Reading every link and filtering afterwards would page an arbitrary prefix
  // of the links, which one member could fill with their own attachments.
  it('never reads the link rows itself', async () => {
    const { service, targetRepository } = buildService();

    await service.resolveAuthorizedRecordOrThrow({
      workspaceId: WORKSPACE_ID,
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });

    expect(targetRepository.find).not.toHaveBeenCalled();
  });
});

describe('Authorizing the record a conversation is attached to', () => {
  it('refuses to attach to a record the member cannot read', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.attachThreadToRecord({
        ...args,
        recordId: UNREADABLE_RECORD_ID,
      }),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });

    expect(targetRepository.insert).not.toHaveBeenCalled();
  });

  it('refuses to detach from a record the member cannot read', async () => {
    const { service, targetRepository } = buildService();

    await expect(
      service.detachThreadFromRecord({
        ...args,
        recordId: UNREADABLE_RECORD_ID,
      }),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });

    expect(targetRepository.delete).not.toHaveBeenCalled();
  });

  it('refuses to resolve a record the member cannot read', async () => {
    const { service } = buildService();

    await expect(
      service.resolveAuthorizedRecordOrThrow({
        workspaceId: WORKSPACE_ID,
        objectNameSingular: 'company',
        recordId: UNREADABLE_RECORD_ID,
      }),
    ).rejects.toMatchObject({ code: 'RECORD_NOT_FOUND' });
  });

  it('reads the record through the caller permissions, not the system context', async () => {
    const { service, recordRepository } = buildService();

    await service.attachThreadToRecord(args);

    // A bypassing read would let a member link a conversation to a record they
    // are not allowed to see.
    expect(recordRepository.findOne).toHaveBeenCalledWith({
      where: { id: RECORD_ID },
      select: { id: true },
    });
  });
});

describe('Cleaning up the links of a destroyed record', () => {
  const destroyArgs = {
    workspaceId: WORKSPACE_ID,
    objectNameSingular: 'company',
    recordIds: [RECORD_ID],
  };

  it('deletes every link that pointed at the destroyed record', async () => {
    const { service, targetRepository } = buildService();

    await service.deleteTargetsForDestroyedRecords(destroyArgs);

    expect(targetRepository.delete).toHaveBeenCalledTimes(1);

    const [criteria] = targetRepository.delete.mock.calls[0];

    expect(criteria.objectMetadataId).toBe(COMPANY_OBJECT_METADATA_ID);
    expect(criteria.recordId._value).toEqual([RECORD_ID]);
  });

  it('does nothing when no record was destroyed', async () => {
    const { service, targetRepository } = buildService();

    await service.deleteTargetsForDestroyedRecords({
      ...destroyArgs,
      recordIds: [],
    });

    expect(targetRepository.delete).not.toHaveBeenCalled();
  });

  // Destroy fires in every workspace, including ones this feature never
  // reached, and cleanup must stay silent there rather than throwing.
  it('does nothing in a workspace whose history still routes to core', async () => {
    const { service, targetRepository, storage } = buildService();

    storage.storage = 'core';

    await expect(
      service.deleteTargetsForDestroyedRecords(destroyArgs),
    ).resolves.toBeUndefined();

    expect(targetRepository.delete).not.toHaveBeenCalled();
  });

  it('does nothing in a workspace that has no target object yet', async () => {
    const { service, targetRepository, workspaceCacheService } = buildService();

    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          company: {
            id: COMPANY_OBJECT_METADATA_ID,
            nameSingular: 'company',
            namePlural: 'companies',
          },
        },
      },
    });

    await expect(
      service.deleteTargetsForDestroyedRecords(destroyArgs),
    ).resolves.toBeUndefined();

    expect(targetRepository.delete).not.toHaveBeenCalled();
  });
});
