import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, type TestingModule } from '@nestjs/testing';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKSPACE_SIGNAL_CLEARED_EVENT } from 'src/engine/core-modules/workspace-signal/constants/workspace-signal-cleared-event.constant';
import { WORKSPACE_SIGNAL_DEFAULT_TTL_MS } from 'src/engine/core-modules/workspace-signal/constants/workspace-signal-default-ttl-ms.constant';
import { WorkspaceSignalService } from 'src/engine/core-modules/workspace-signal/services/workspace-signal.service';

const WORKSPACE_ID = 'workspace-id';

describe('WorkspaceSignalService', () => {
  let service: WorkspaceSignalService;
  let cacheStorage: {
    get: jest.Mock;
    setIfAbsent: jest.Mock;
    expire: jest.Mock;
    del: jest.Mock;
  };
  let eventEmitter: { emit: jest.Mock };

  beforeEach(async () => {
    cacheStorage = {
      get: jest.fn().mockResolvedValue(undefined),
      setIfAbsent: jest.fn().mockResolvedValue(true),
      expire: jest.fn().mockResolvedValue(true),
      del: jest.fn().mockResolvedValue(undefined),
    };
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceSignalService,
        {
          provide: CacheStorageNamespace.EngineWorkspaceSignal,
          useValue: cacheStorage,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get(WorkspaceSignalService);
  });

  it('sets a signal with its start time and the default ttl', async () => {
    await service.set({ workspaceId: WORKSPACE_ID, name: 'messaging.import' });

    expect(cacheStorage.setIfAbsent).toHaveBeenCalledWith(
      `${WORKSPACE_ID}:messaging.import`,
      { since: expect.any(String) },
      WORKSPACE_SIGNAL_DEFAULT_TTL_MS,
    );
    expect(cacheStorage.expire).not.toHaveBeenCalled();
  });

  it('only refreshes the ttl of a signal that is already set', async () => {
    cacheStorage.setIfAbsent.mockResolvedValue(false);

    await service.set({
      workspaceId: WORKSPACE_ID,
      name: 'messaging.import',
      ttlMs: 1000,
    });

    expect(cacheStorage.expire).toHaveBeenCalledWith(
      `${WORKSPACE_ID}:messaging.import`,
      1000,
    );
  });

  it('clears a set signal and announces it with its start time', async () => {
    cacheStorage.get.mockResolvedValue({ since: '2026-10-06T09:00:00.000Z' });

    await service.clear({
      workspaceId: WORKSPACE_ID,
      name: 'messaging.initialImport',
    });

    expect(cacheStorage.del).toHaveBeenCalledWith(
      `${WORKSPACE_ID}:messaging.initialImport`,
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      WORKSPACE_SIGNAL_CLEARED_EVENT,
      {
        workspaceId: WORKSPACE_ID,
        name: 'messaging.initialImport',
        since: '2026-10-06T09:00:00.000Z',
      },
    );
  });

  it('stays silent when clearing a signal that is not set', async () => {
    await service.clear({
      workspaceId: WORKSPACE_ID,
      name: 'messaging.initialImport',
    });

    expect(cacheStorage.del).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });

  it('reads only the signals that are set', async () => {
    cacheStorage.get.mockImplementation(async (key: string) =>
      key.endsWith('messaging.import')
        ? { since: '2026-10-06T09:00:00.000Z' }
        : undefined,
    );

    await expect(
      service.read({
        workspaceId: WORKSPACE_ID,
        names: ['messaging.import', 'messaging.initialImport'],
      }),
    ).resolves.toEqual({
      'messaging.import': { since: '2026-10-06T09:00:00.000Z' },
    });
  });
});
