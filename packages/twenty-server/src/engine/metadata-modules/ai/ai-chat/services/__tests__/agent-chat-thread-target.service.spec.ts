import {
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type EntityManager } from 'typeorm';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import {
  type AgentHistoryStorageService,
  type AgentHistoryStorageContext,
} from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

jest.mock(
  'src/engine/workspace-cache/services/workspace-cache.service',
  () => ({ WorkspaceCacheService: class {} }),
);
jest.mock('src/engine/twenty-orm/workspace-orm.manager', () => ({
  WorkspaceOrmManager: class {},
}));

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-21T00:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: 'owner',
} as UserWorkspaceAuthContext;
const TARGET = {
  objectMetadataId:
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.company.universalIdentifier
    ]!.id,
  recordId: 'record',
  threadId: 'thread',
};

describe('Agent chat thread target authorization', () => {
  const query = jest.fn();
  const findOne = jest.fn();
  const getRepository = jest.fn(() => ({ findOne }));
  const runStorage = jest.fn();
  const service = new AgentChatThreadTargetService(
    {
      getOrRecompute: async () => allFlatEntityMaps,
    } as unknown as WorkspaceCacheService,
    {
      executeInWorkspaceContext: async (work: () => Promise<unknown>) => work(),
      getRepository,
    } as unknown as WorkspaceOrmManager,
    { run: runStorage } as unknown as AgentHistoryStorageService,
  );
  const run = (work: () => Promise<unknown>) =>
    withWorkspaceAuthContext(AUTH_CONTEXT, work);
  beforeEach(() => {
    query.mockReset().mockResolvedValue([]);
    findOne.mockReset().mockResolvedValue({ id: TARGET.recordId });
    getRepository.mockClear();
    runStorage
      .mockReset()
      .mockImplementation(
        async (
          _workspaceId: string,
          work: (context: AgentHistoryStorageContext) => Promise<unknown>,
        ) =>
          work({
            storage: 'workspace',
            manager: { query } as unknown as EntityManager,
            table: () => 'thread',
          }),
      );
  });

  it.each(['attach', 'detach'] as const)(
    'rejects %s by someone who does not own the thread',
    async (method) => {
      await expect(run(() => service[method](TARGET))).rejects.toThrow(
        'Thread not found',
      );
      expect(query).toHaveBeenCalledTimes(1);
      expect(query.mock.calls[0][1]).toEqual([
        TARGET.threadId,
        AUTH_CONTEXT.userWorkspaceId,
      ]);
    },
  );

  it.each(['attach', 'detach', 'findForRecord'] as const)(
    'requires permission-filtered record access before %s',
    async (method) => {
      findOne.mockResolvedValue(null);
      await expect(
        run(() => service[method]({ ...TARGET, limit: 50, offset: 0 })),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(getRepository).toHaveBeenCalledWith('company');
      expect(runStorage).not.toHaveBeenCalled();
    },
  );

  it('rejects an unsupported object before reading records', async () => {
    await expect(
      run(() =>
        service.attach({ ...TARGET, objectMetadataId: 'foreign-object' }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(getRepository).not.toHaveBeenCalled();
    expect(runStorage).not.toHaveBeenCalled();
  });

  it('rejects a non-user auth context', async () => {
    await expect(
      withWorkspaceAuthContext(
        { type: 'system', workspace: AUTH_CONTEXT.workspace },
        () => service.attach(TARGET),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(runStorage).not.toHaveBeenCalled();
  });

  it('refuses legacy history storage before issuing attachment queries', async () => {
    runStorage.mockImplementation(
      async (
        _workspaceId: string,
        work: (context: AgentHistoryStorageContext) => Promise<unknown>,
      ) =>
        work({
          storage: 'core',
          manager: { query } as unknown as EntityManager,
          table: () => 'thread',
        }),
    );
    await expect(run(() => service.attach(TARGET))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(query).not.toHaveBeenCalled();
  });
});
