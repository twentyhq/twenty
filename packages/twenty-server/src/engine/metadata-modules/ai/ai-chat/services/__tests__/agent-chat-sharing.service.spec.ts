import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const THREAD_ID = '20202020-0000-4000-8000-000000000002';
const args = {
  workspaceId: WORKSPACE_ID,
  threadId: THREAD_ID,
  workspaceMemberId: 'reader',
};

const buildService = () => {
  const query = jest.fn().mockResolvedValue([{ id: THREAD_ID }]);
  const thread: Record<string, unknown> = {
    id: THREAD_ID,
    workspaceMemberId: 'owner',
  };
  const threadRepository = {
    query: jest
      .fn()
      .mockImplementation(
        async (
          _workspaceId: string,
          work: (context: AgentHistoryStorageContext) => Promise<unknown>,
        ) =>
          work({
            manager: { query },
            table: () => '"workspace"."agentChatThread"',
          } as never),
      ),
    findOne: jest.fn().mockResolvedValue(thread),
    find: jest.fn().mockResolvedValue([thread]),
  };
  const authContext = {
    workspace: { id: WORKSPACE_ID },
    workspaceMemberId: 'reader',
    userWorkspaceId: 'reader-membership',
  };
  const userAuthContextService = {
    resolveWorkspaceMember: jest.fn().mockResolvedValue(authContext),
  };
  const repository = {
    validateWriteIsPermitted: jest.fn(),
    findRecordIdsAllowedForOperation: jest.fn().mockResolvedValue([THREAD_ID]),
    find: jest.fn().mockResolvedValue([{ id: THREAD_ID }]),
  };
  const manager = {
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation(async (work: () => Promise<unknown>) => work()),
    getRepositoryWithContextPermissions: () => repository,
  };
  const objectMetadata = {
    id: 'object',
    readability: MetadataReadability.PRIVATE,
  };
  const flatFieldMetadataMaps = {
    byUniversalIdentifier: {} as Record<string, unknown>,
  };
  const cache = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.agentChatThread.universalIdentifier]:
            objectMetadata,
        },
      },
      flatFieldMetadataMaps,
    }),
  };
  const aiPermissions = {
    userHasWorkspaceSettingPermission: jest.fn().mockResolvedValue(true),
  };
  const permissions = {
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canSoftDelete: false,
  };
  const sharing = {
    getPermissions: jest.fn().mockResolvedValue(permissions),
    getPermissionsForRecords: jest
      .fn()
      .mockResolvedValue(new Map([[THREAD_ID, permissions]])),
  };
  const service = new AgentChatSharingService(
    threadRepository as never,
    userAuthContextService as never,
    { deleteByRecordIdsInTransaction: jest.fn() } as never,
    cache as never,
    aiPermissions as never,
    sharing as never,
    manager as never,
  );
  return {
    query,
    service,
    thread,
    flatFieldMetadataMaps,
    threadRepository,
    userAuthContextService,
    repository,
    manager,
    objectMetadata,
    aiPermissions,
    sharing,
    permissions,
    authContext,
  };
};

describe('Conversation common record access', () => {
  it('creates threads owned by the member, with the legacy owner', async () => {
    const { service, query } = buildService();
    await expect(
      service.createThread({
        workspaceId: WORKSPACE_ID,
        workspaceMemberId: 'reader',
        id: THREAD_ID,
      }),
    ).resolves.toMatchObject({ id: THREAD_ID });
    const [insert, parameters] = query.mock.calls[0];
    expect(insert).toContain('"workspaceMemberId"');
    expect(insert).toContain('"userWorkspaceId"');
    expect(parameters).toEqual([
      THREAD_ID,
      null,
      'reader',
      'reader-membership',
    ]);
  });

  it('uses the common record policy for a non-owner reader', async () => {
    const { service, repository } = buildService();
    await expect(service.getReadableThread(args)).resolves.toMatchObject({
      id: THREAD_ID,
    });
    expect(repository.findRecordIdsAllowedForOperation).toHaveBeenCalledWith({
      recordIds: [THREAD_ID],
      operationType: 'select',
      updatedColumns: [],
      withDeleted: false,
    });
  });

  it.each(['update', 'delete', 'soft-delete', 'restore'] as const)(
    'uses the corresponding %s permission without an owner override',
    async (operation) => {
      const { service, repository } = buildService();
      await expect(
        service.getThreadWithAccess({ ...args, operationType: operation }),
      ).resolves.toBeDefined();
      repository.findRecordIdsAllowedForOperation.mockResolvedValue([]);
      await expect(
        service.getThreadWithAccess({
          ...args,
          workspaceMemberId: 'owner',
          operationType: operation,
        }),
      ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
    },
  );

  it('checks field permissions when renaming', async () => {
    const { service, repository } = buildService();
    await service.getThreadWithAccess({
      ...args,
      operationType: 'update',
      updatedColumns: ['title'],
    });
    expect(repository.findRecordIdsAllowedForOperation).toHaveBeenCalledWith({
      recordIds: [THREAD_ID],
      operationType: 'update',
      updatedColumns: ['title'],
      withDeleted: false,
    });
  });

  it('rechecks the authenticated subject and policy on every read', async () => {
    const { service, repository, userAuthContextService } = buildService();
    await expect(service.getReadableThread(args)).resolves.toBeDefined();
    repository.findRecordIdsAllowedForOperation.mockResolvedValue([]);
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    expect(userAuthContextService.resolveWorkspaceMember).toHaveBeenCalledTimes(
      2,
    );
  });

  it('hides history from removed members', async () => {
    const { service, userAuthContextService, threadRepository } =
      buildService();
    userAuthContextService.resolveWorkspaceMember.mockRejectedValue(
      new AuthException('Removed', AuthExceptionCode.UNAUTHENTICATED),
    );
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    expect(threadRepository.findOne).not.toHaveBeenCalled();
  });

  it('does not hide infrastructure failures as missing records', async () => {
    const { service, userAuthContextService } = buildService();
    userAuthContextService.resolveWorkspaceMember.mockRejectedValue(
      new Error('Database unavailable'),
    );
    await expect(service.getReadableThread(args)).rejects.toThrow(
      'Database unavailable',
    );
  });

  it('denies access when AI permission has been revoked', async () => {
    const { service, aiPermissions } = buildService();
    aiPermissions.userHasWorkspaceSettingPermission.mockResolvedValue(false);
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
  });

  it('does not bypass the common policy for owners of SYSTEM history', async () => {
    const { service, objectMetadata, repository } = buildService();
    objectMetadata.readability = MetadataReadability.SYSTEM;
    repository.findRecordIdsAllowedForOperation.mockResolvedValue([]);
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    await expect(
      service.getReadableThread({ ...args, workspaceMemberId: 'owner' }),
    ).rejects.toMatchObject({ code: 'THREAD_NOT_FOUND' });
    expect(repository.findRecordIdsAllowedForOperation).toHaveBeenCalledTimes(
      2,
    );
  });

  it('returns common capabilities, including destructive permission differences', async () => {
    const { service, sharing, permissions, authContext } = buildService();
    await expect(service.getPermissions(args)).resolves.toEqual(permissions);
    expect(sharing.getPermissionsForRecords).toHaveBeenCalledWith({
      authContext,
      objectMetadataId: 'object',
      recordIds: [THREAD_ID],
      withDeleted: false,
    });
  });

  it.each([MetadataReadability.SYSTEM, MetadataReadability.PRIVATE])(
    'bounds the readable thread list before ranking for %s metadata',
    async (readability) => {
      const { service, repository, objectMetadata, sharing } = buildService();
      objectMetadata.readability = readability;
      await service.getReadableThreadIds(args);
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1000,
          order: { updatedAt: 'DESC', id: 'DESC' },
        }),
      );
      expect(sharing.getPermissionsForRecords).not.toHaveBeenCalled();
    },
  );

  it('batches capabilities and lists only records admitted by the ordinary repository', async () => {
    const { service, sharing } = buildService();
    await expect(service.getReadableThreadIds(args)).resolves.toEqual([
      THREAD_ID,
    ]);
    await service.getPermissionsForThreads({ ...args, threadIds: [THREAD_ID] });
    expect(sharing.getPermissionsForRecords).toHaveBeenCalledTimes(1);
  });

  it.each(['update', 'delete', 'soft-delete', 'restore'] as const)(
    'refuses %s on a workflow run conversation while still letting its readers read it',
    async (operation) => {
      const { service, thread } = buildService();
      thread.workflowRunId = 'workflow-run';
      await expect(service.getReadableThread(args)).resolves.toBeDefined();
      await expect(
        service.getThreadWithAccess({ ...args, operationType: operation }),
      ).rejects.toMatchObject({ code: 'WORKFLOW_RUN_THREAD_READ_ONLY' });
    },
  );

  it('leaves workflow run conversations out of the chat list once threads can name a run', async () => {
    const { service, repository, flatFieldMetadataMaps } = buildService();
    await service.getReadableThreadIds(args);
    expect(repository.find).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: undefined }),
    );
    flatFieldMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.fields.workflowRun.universalIdentifier
    ] = {};
    await service.getReadableThreadIds(args);
    expect(repository.find).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { workflowRunId: expect.objectContaining({ _type: 'isNull' }) },
      }),
    );
  });
});
