import { Test } from '@nestjs/testing';

import { DEFAULT_AI_CHAT_ASSISTANT_PROFILE } from 'twenty-shared/ai';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('workspace assistant profile cache', () => {
  const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const storedProfile = {
    ...DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    displayName: 'Nova',
  };
  const coreEntityCacheService = {
    invalidateAndRecompute: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue({
      id: workspaceId,
      aiChatAssistantProfile: storedProfile,
    }),
  };
  let workspaceService: WorkspaceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [WorkspaceService],
    })
      .useMocker((token) =>
        token === CoreEntityCacheService ? coreEntityCacheService : {},
      )
      .compile();

    workspaceService = module.get(WorkspaceService);
  });

  it('rebuilds the shared workspace cache when an earlier cached projection omits the profile', async () => {
    const cachedWorkspace = Object.assign(new WorkspaceEntity(), {
      id: workspaceId,
    });

    expect(
      await workspaceService.getAiChatAssistantProfile(cachedWorkspace),
    ).toEqual(storedProfile);
    expect(coreEntityCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
      'workspaceEntity',
      workspaceId,
    );
    expect(coreEntityCacheService.get).toHaveBeenCalledWith(
      'workspaceEntity',
      workspaceId,
    );
  });

  it('returns the projected profile without reading or rebuilding the cache', async () => {
    const workspace = Object.assign(new WorkspaceEntity(), {
      id: workspaceId,
      aiChatAssistantProfile: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    });

    expect(await workspaceService.getAiChatAssistantProfile(workspace)).toEqual(
      DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    );
    expect(
      coreEntityCacheService.invalidateAndRecompute,
    ).not.toHaveBeenCalled();
    expect(coreEntityCacheService.get).not.toHaveBeenCalled();
  });
});
