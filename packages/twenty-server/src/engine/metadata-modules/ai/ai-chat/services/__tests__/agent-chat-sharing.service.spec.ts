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
  userWorkspaceId: 'reader',
};

const buildService = () => {
  const thread = { id: THREAD_ID, userWorkspaceId: 'owner' };
  const threadRepository = {
    findOne: jest.fn().mockResolvedValue(thread),
    find: jest.fn().mockResolvedValue([thread]),
  };
  const authContext = {
    workspace: { id: WORKSPACE_ID },
    userWorkspaceId: 'reader',
  };
  const userAuthContextService = {
    resolve: jest.fn().mockResolvedValue(authContext),
  };
  const repository = {
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
  const cache = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.agentChatThread.universalIdentifier]:
            objectMetadata,
        },
      },
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
    {} as never,
    cache as never,
    aiPermissions as never,
    sharing as never,
    manager as never,
  );
  return {
    service,
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
          userWorkspaceId: 'owner',
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
    expect(userAuthContextService.resolve).toHaveBeenCalledTimes(2);
  });

  it('hides history from removed members', async () => {
    const { service, userAuthContextService, threadRepository } =
      buildService();
    userAuthContextService.resolve.mockRejectedValue(
      new AuthException('Removed', AuthExceptionCode.UNAUTHENTICATED),
    );
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    expect(threadRepository.findOne).not.toHaveBeenCalled();
  });

  it('does not hide infrastructure failures as missing records', async () => {
    const { service, userAuthContextService } = buildService();
    userAuthContextService.resolve.mockRejectedValue(
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

  it('keeps legacy SYSTEM history owner-only until migration', async () => {
    const { service, objectMetadata, repository } = buildService();
    objectMetadata.readability = MetadataReadability.SYSTEM;
    await expect(service.getReadableThread(args)).rejects.toMatchObject({
      code: 'THREAD_NOT_FOUND',
    });
    await expect(
      service.getReadableThread({ ...args, userWorkspaceId: 'owner' }),
    ).resolves.toBeDefined();
    expect(repository.findRecordIdsAllowedForOperation).not.toHaveBeenCalled();
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
      const { service, repository, threadRepository, objectMetadata, sharing } =
        buildService();
      objectMetadata.readability = readability;
      await service.getReadableThreadIds(args);
      const selectedRepository =
        readability === MetadataReadability.SYSTEM
          ? threadRepository
          : repository;
      expect(selectedRepository.find).toHaveBeenCalledWith(
        ...(readability === MetadataReadability.SYSTEM ? [WORKSPACE_ID] : []),
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
});
