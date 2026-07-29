import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Not, type Repository } from 'typeorm';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { PrefillLogicFunctionService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-logic-function.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';

jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-companies.util',
  () => ({ prefillCompanies: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-people.util',
  () => ({ prefillPeople: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflows.util',
  () => ({ prefillWorkflows: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-opportunities.util',
  () => ({ prefillOpportunities: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-dashboards.util',
  () => ({ prefillDashboards: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflow-command-menu-items.util',
  () => ({ prefillWorkflowCommandMenuItems: jest.fn() }),
);
jest.mock(
  'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-workflow-code-step-logic-functions.util',
  () => ({
    getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionDefinitions: jest
      .fn()
      .mockReturnValue([]),
  }),
);

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let userRepository: Repository<UserEntity>;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let workspaceCacheStorageService: WorkspaceCacheStorageService;
  let messageQueueService: MessageQueueService;
  let dnsManagerService: DnsManagerService;
  let billingSubscriptionService: BillingSubscriptionService;
  let userWorkspaceService: UserWorkspaceService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            manager: {
              connection: { driver: { options: { type: 'postgres' } } },
            },
            metadata: { columns: [] },
          },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            find: jest.fn(),
            softDelete: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            softDelete: jest.fn(),
          },
        },
        {
          provide: BillingService,
          useValue: {
            isBillingEnabled: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {
            cancelSubscription: jest.fn(),
            assertSubscriptionCanceledOrNone: jest.fn(),
          },
        },
        ...[
          WorkspaceManagerService,
          DnsManagerService,
          CustomDomainManagerService,
          SubdomainManagerService,
          TwentyConfigService,
          ExceptionHandlerService,
          PermissionsService,
          FeatureFlagService,
          FileCorePictureService,
          AiModelRegistryService,
          ApplicationService,
          PreInstalledAppsService,
          SdkClientGenerationService,
          PrefillLogicFunctionService,
          WorkspaceMigrationValidateBuildAndRunService,
          UpgradeMigrationService,
          UpgradeSequenceReaderService,
        ].map((service) => ({
          provide: service,
          useValue: {},
        })),
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            flush: jest.fn(),
          },
        },
        {
          provide: WorkspaceDataSourceService,
          useValue: {
            deleteWorkspaceDBSchema: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            flushFlatEntityMaps: jest.fn(),
            getOrRecomputeManyOrAllFlatEntityMaps: jest
              .fn()
              .mockResolvedValue(createEmptyAllFlatEntityMaps()),
          },
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            deleteUserWorkspace: jest.fn(),
          },
        },
        {
          provide: getQueueToken(MessageQueue.deleteCascadeQueue),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: CoreEntityCacheService,
          useValue: {
            invalidate: jest.fn(),
          },
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                delete: jest.fn().mockResolvedValue({ affected: 0 }),
                update: jest.fn().mockResolvedValue({ affected: 1 }),
              },
            }),
            getRepository: jest.fn().mockReturnValue({
              find: jest.fn().mockResolvedValue([]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
    workspaceCacheStorageService = module.get<WorkspaceCacheStorageService>(
      WorkspaceCacheStorageService,
    );
    messageQueueService = module.get<MessageQueueService>(
      getQueueToken(MessageQueue.deleteCascadeQueue),
    );
    dnsManagerService = module.get<DnsManagerService>(DnsManagerService);
    dnsManagerService.deleteHostnameSilently = jest.fn();
    billingSubscriptionService = module.get<BillingSubscriptionService>(
      BillingSubscriptionService,
    );
    userWorkspaceService =
      module.get<UserWorkspaceService>(UserWorkspaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleRemoveWorkspaceMember', () => {
    it('should soft delete the user workspace record', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([
        {
          userId: 'user-id',
          workspaceId: 'workspace-id',
          id: 'user-workspace-id',
        } as UserWorkspaceEntity,
      ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        true,
      );

      expect(userWorkspaceService.deleteUserWorkspace).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        softDelete: true,
      });
      expect(userWorkspaceRepository.delete).not.toHaveBeenCalled();
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-id');
    });

    it('should destroy the user workspace record', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([
        {
          id: 'user-workspace-id',
          userId: 'user-id',
          workspaceId: 'workspace-id',
        } as UserWorkspaceEntity,
      ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        false,
      );

      expect(userWorkspaceService.deleteUserWorkspace).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        softDelete: false,
      });
      expect(userRepository.softDelete).toHaveBeenCalledWith('user-id');
    });

    it('should not soft delete the user record if there are other user workspace records', async () => {
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([
        {
          id: 'remaining-user-workspace-id',
          userId: 'user-id',
          workspaceId: 'other-workspace-id',
        } as UserWorkspaceEntity,
        {
          id: 'user-workspace-id',
          userId: 'user-id',
          workspaceId: 'workspace-id',
        } as UserWorkspaceEntity,
      ]);

      await service.handleRemoveWorkspaceMember(
        'workspace-id',
        'user-id',
        false,
      );

      expect(userWorkspaceService.deleteUserWorkspace).toHaveBeenCalledWith({
        userWorkspaceId: 'user-workspace-id',
        softDelete: false,
      });
      expect(userWorkspaceService.deleteUserWorkspace).not.toHaveBeenCalledWith(
        {
          userWorkspaceId: 'remaining-user-workspace-id',
          softDelete: false,
        },
      );
      expect(userRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('deleteWorkspace', () => {
    it('should hard delete the workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, false);

      expect(
        billingSubscriptionService.assertSubscriptionCanceledOrNone,
      ).toHaveBeenCalledWith(mockWorkspace.id);
      expect(workspaceCacheStorageService.flush).toHaveBeenCalledWith(
        mockWorkspace.id,
      );
      expect(messageQueueService.add).toHaveBeenCalled();
      expect(workspaceRepository.delete).toHaveBeenCalledWith(mockWorkspace.id);
      expect(workspaceRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should soft delete the workspace', async () => {
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, true);

      expect(
        billingSubscriptionService.cancelSubscription,
      ).toHaveBeenCalledWith(mockWorkspace.id);
      expect(workspaceRepository.softDelete).toHaveBeenCalledWith({
        id: mockWorkspace.id,
      });
      expect(workspaceRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete the custom domain when hard deleting a workspace with a custom domain', async () => {
      const customDomain = 'custom.example.com';
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
        customDomain,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, false);

      expect(dnsManagerService.deleteHostnameSilently).toHaveBeenCalledWith(
        customDomain,
      );
    });

    it('should not delete the custom domain when soft deleting a workspace with a custom domain', async () => {
      const customDomain = 'custom.example.com';
      const mockWorkspace = {
        id: 'workspace-id',
        metadataVersion: 0,
        customDomain,
      } as WorkspaceEntity;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);
      jest.spyOn(userWorkspaceRepository, 'find').mockResolvedValue([]);

      await service.deleteWorkspace(mockWorkspace.id, true);

      expect(dnsManagerService.deleteHostnameSilently).not.toHaveBeenCalled();
      expect(workspaceRepository.softDelete).toHaveBeenCalledWith({
        id: mockWorkspace.id,
      });
    });
  });

  describe('suspendWorkspace', () => {
    it('should only suspend workspaces that are not already suspended and not soft-deleted', async () => {
      jest
        .spyOn(workspaceRepository, 'update')
        .mockResolvedValue({ affected: 1 } as never);

      const hasBeenSuspended = await service.suspendWorkspace('workspace-id');

      expect(workspaceRepository.update).toHaveBeenCalledWith(
        {
          id: 'workspace-id',
          activationStatus: Not(WorkspaceActivationStatus.SUSPENDED),
          deletedAt: IsNull(),
        },
        expect.objectContaining({
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
        }),
      );
      expect(hasBeenSuspended).toBe(true);
    });

    it('should report no suspension when the guarded update affects no rows', async () => {
      jest
        .spyOn(workspaceRepository, 'update')
        .mockResolvedValue({ affected: 0 } as never);

      const hasBeenSuspended = await service.suspendWorkspace('workspace-id');

      expect(hasBeenSuspended).toBe(false);
    });
  });

  describe('activateWorkspace', () => {
    // getWorkspaceSchemaName hashes the id, so it has to be a real uuid.
    const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

    const setupActivationMocks = () => {
      const callOrder: string[] = [];

      jest
        .spyOn(workspaceRepository, 'update')
        .mockResolvedValue({ affected: 1 } as never);
      workspaceRepository.findOneBy = jest.fn().mockResolvedValue({
        id: WORKSPACE_ID,
      });

      const workspaceManagerService = module.get<WorkspaceManagerService>(
        WorkspaceManagerService,
      );

      workspaceManagerService.init = jest.fn();

      const featureFlagService =
        module.get<FeatureFlagService>(FeatureFlagService);

      featureFlagService.enableFeatureFlags = jest.fn();

      userWorkspaceService.createWorkspaceMember = jest.fn();

      const prefillLogicFunctionService =
        module.get<PrefillLogicFunctionService>(PrefillLogicFunctionService);

      prefillLogicFunctionService.ensureSeeded = jest.fn();

      const twentyConfigService =
        module.get<TwentyConfigService>(TwentyConfigService);

      twentyConfigService.get = jest.fn().mockReturnValue('2.0.0');

      const billingService = module.get<BillingService>(BillingService);

      billingService.hasWorkspaceAnySubscription = jest
        .fn()
        .mockResolvedValue(false);

      const upgradeMigrationService = module.get<UpgradeMigrationService>(
        UpgradeMigrationService,
      );

      upgradeMigrationService.getLastAttemptedInstanceCommandOrThrow = jest
        .fn()
        .mockResolvedValue({ name: 'command', status: 'completed' });
      upgradeMigrationService.markAsWorkspaceInitial = jest
        .fn()
        .mockImplementation(async () => {
          callOrder.push('markAsWorkspaceInitial');
        });

      const upgradeSequenceReaderService =
        module.get<UpgradeSequenceReaderService>(UpgradeSequenceReaderService);

      upgradeSequenceReaderService.getInitialCursorForNewWorkspace = jest
        .fn()
        .mockReturnValue({ name: 'command', status: 'completed' });

      const preInstalledAppsService = module.get<PreInstalledAppsService>(
        PreInstalledAppsService,
      );

      preInstalledAppsService.installOnWorkspace = jest
        .fn()
        .mockImplementation(async () => {
          callOrder.push('installOnWorkspace');
        });

      const sdkClientGenerationService = module.get<SdkClientGenerationService>(
        SdkClientGenerationService,
      );

      sdkClientGenerationService.enqueueSdkClientGenerationForWorkspace =
        jest.fn();

      return { callOrder, preInstalledAppsService };
    };

    // The compatibility check of an app pinning `engines.twenty` resolves the
    // workspace version from its upgrade cursor, so installing before the
    // cursor exists rejects every pinned pre-installed app.
    it('should install pre-installed apps after the upgrade cursor is written', async () => {
      const { callOrder, preInstalledAppsService } = setupActivationMocks();

      await service.activateWorkspace(
        { id: 'user-id' } as never,
        { id: WORKSPACE_ID } as WorkspaceEntity,
      );

      expect(preInstalledAppsService.installOnWorkspace).toHaveBeenCalledWith(
        WORKSPACE_ID,
      );
      expect(callOrder).toEqual([
        'markAsWorkspaceInitial',
        'installOnWorkspace',
      ]);
    });

    it('should not fail activation when installing pre-installed apps throws', async () => {
      const { preInstalledAppsService } = setupActivationMocks();

      preInstalledAppsService.installOnWorkspace = jest
        .fn()
        .mockRejectedValue(new Error('install failed'));

      const exceptionHandlerService = module.get<ExceptionHandlerService>(
        ExceptionHandlerService,
      );

      exceptionHandlerService.captureExceptions = jest.fn();

      await expect(
        service.activateWorkspace(
          { id: 'user-id' } as never,
          { id: WORKSPACE_ID } as WorkspaceEntity,
        ),
      ).resolves.toEqual({ id: WORKSPACE_ID });
    });
  });
});
