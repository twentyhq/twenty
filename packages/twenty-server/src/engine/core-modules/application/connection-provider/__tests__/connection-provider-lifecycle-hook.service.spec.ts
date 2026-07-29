import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ON_CONNECT_UID = 'c1c1c1c1-c1c1-4c1c-c1c1-c1c1c1c1c1c1';
const ON_DISCONNECT_UID = 'd2d2d2d2-d2d2-4d2d-d2d2-d2d2d2d2d2d2';

describe('ConnectionProviderLifecycleHookService', () => {
  let service: ConnectionProviderLifecycleHookService;
  let connectionProviderService: { findOneByIdOrThrow: jest.Mock };
  let workspaceCacheService: { getOrRecompute: jest.Mock };
  let messageQueueService: { add: jest.Mock };
  let exceptionHandlerService: { captureExceptions: jest.Mock };

  const baseProvider = {
    id: 'provider-1',
    name: 'linear',
    onConnectLogicFunctionUniversalIdentifier: null,
    onDisconnectLogicFunctionUniversalIdentifier: null,
  } as unknown as ConnectionProviderEntity;

  beforeEach(async () => {
    connectionProviderService = {
      findOneByIdOrThrow: jest.fn(async () => baseProvider),
    };
    workspaceCacheService = {
      getOrRecompute: jest.fn(async () => ({
        flatLogicFunctionMaps: { byUniversalIdentifier: {} },
      })),
    };
    messageQueueService = { add: jest.fn() };
    exceptionHandlerService = { captureExceptions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionProviderLifecycleHookService,
        {
          provide: ConnectionProviderService,
          useValue: connectionProviderService,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: getQueueToken(MessageQueue.logicFunctionQueue),
          useValue: messageQueueService,
        },
        { provide: ExceptionHandlerService, useValue: exceptionHandlerService },
      ],
    }).compile();

    service = module.get(ConnectionProviderLifecycleHookService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('dispatchOnConnect', () => {
    it('does not dispatch a hook when the provider declares none', async () => {
      await service.dispatchOnConnect({
        provider: baseProvider,
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('enqueues the declared on-connect logic function in the connecting workspace', async () => {
      workspaceCacheService.getOrRecompute.mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: { [ON_CONNECT_UID]: { id: 'function-1' } },
        },
      });

      await service.dispatchOnConnect({
        provider: {
          ...baseProvider,
          onConnectLogicFunctionUniversalIdentifier: ON_CONNECT_UID,
        },
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledWith(
        'workspace-1',
        ['flatLogicFunctionMaps'],
      );
      expect(messageQueueService.add).toHaveBeenCalledWith(
        'LogicFunctionTriggerJob',
        {
          logicFunctionId: 'function-1',
          workspaceId: 'workspace-1',
          payload: {
            connectionProviderId: 'provider-1',
            connectionProviderName: 'linear',
            connectedAccountId: 'account-1',
          },
        },
        { retryLimit: 3 },
      );
    });

    it('reports to Sentry without throwing when the hook function is missing', async () => {
      await service.dispatchOnConnect({
        provider: {
          ...baseProvider,
          onConnectLogicFunctionUniversalIdentifier: ON_CONNECT_UID,
        },
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledTimes(
        1,
      );
    });

    it('treats a soft-deleted hook function as missing instead of enqueuing it', async () => {
      workspaceCacheService.getOrRecompute.mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: {
            [ON_CONNECT_UID]: {
              id: 'function-1',
              deletedAt: new Date().toISOString(),
            },
          },
        },
      });

      await service.dispatchOnConnect({
        provider: {
          ...baseProvider,
          onConnectLogicFunctionUniversalIdentifier: ON_CONNECT_UID,
        },
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('dispatchOnDisconnect', () => {
    it('does not dispatch a hook when the provider declares none', async () => {
      await service.dispatchOnDisconnect({
        connectionProviderId: 'provider-1',
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
    });

    it('enqueues the declared on-disconnect logic function in the disconnecting workspace', async () => {
      connectionProviderService.findOneByIdOrThrow.mockResolvedValue({
        ...baseProvider,
        onDisconnectLogicFunctionUniversalIdentifier: ON_DISCONNECT_UID,
      });
      workspaceCacheService.getOrRecompute.mockResolvedValue({
        flatLogicFunctionMaps: {
          byUniversalIdentifier: { [ON_DISCONNECT_UID]: { id: 'function-2' } },
        },
      });

      await service.dispatchOnDisconnect({
        connectionProviderId: 'provider-1',
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(messageQueueService.add).toHaveBeenCalledWith(
        'LogicFunctionTriggerJob',
        {
          logicFunctionId: 'function-2',
          workspaceId: 'workspace-1',
          payload: {
            connectionProviderId: 'provider-1',
            connectionProviderName: 'linear',
            connectedAccountId: 'account-1',
          },
        },
        { retryLimit: 3 },
      );
    });

    it('reports to Sentry without throwing when the provider no longer exists', async () => {
      connectionProviderService.findOneByIdOrThrow.mockRejectedValue(
        new Error('Provider not found'),
      );

      await service.dispatchOnDisconnect({
        connectionProviderId: 'provider-1',
        workspaceId: 'workspace-1',
        connectedAccountId: 'account-1',
      });

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
