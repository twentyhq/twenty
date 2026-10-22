import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';

import { PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { SdkClientGenerationService } from 'src/engine/core-modules/sdk-client/sdk-client-generation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleAssignmentValidationService } from 'src/engine/metadata-modules/role-assignment-validation/services/role-assignment-validation.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceSchemaService } from 'src/engine/workspace-datasource/workspace-schema.service';
import { PrefillLogicFunctionService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-logic-function.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

describe('WorkspaceService.updateWorkspaceById defaultSenderDomain', () => {
  const workspaceId = 'workspace-id';

  let service: WorkspaceService;
  const workspaceRepository = {
    findOneBy: jest.fn(),
    update: jest.fn(),
    findOneByOrFail: jest.fn(),
  };
  const permissionsService = { userHasWorkspaceSettingPermission: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    workspaceRepository.findOneBy.mockResolvedValue({
      id: workspaceId,
      activationStatus: 'ACTIVE',
    });
    workspaceRepository.findOneByOrFail.mockResolvedValue({ id: workspaceId });

    const module = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        { provide: PermissionsService, useValue: permissionsService },
        {
          provide: CoreEntityCacheService,
          useValue: { invalidate: jest.fn() },
        },
        { provide: TwentyConfigService, useValue: { get: jest.fn() } },
        ...[
          getRepositoryToken(UserEntity),
          getRepositoryToken(UserWorkspaceEntity),
          getQueueToken(MessageQueue.deleteCascadeQueue),
          getQueueToken(MessageQueue.applicationLifecycleHookQueue),
          getDataSourceToken(),
          EventEmitter2,
          WorkspaceManagerService,
          FeatureFlagService,
          BillingSubscriptionService,
          BillingService,
          UserWorkspaceService,
          ExceptionHandlerService,
          DnsManagerService,
          WorkspaceManyOrAllFlatEntityMapsCacheService,
          PrefillLogicFunctionService,
          ApplicationService,
          PreInstalledAppsService,
          WorkspaceMigrationValidateBuildAndRunService,
          WorkspaceCacheStorageService,
          SubdomainManagerService,
          WorkspaceSchemaService,
          CustomDomainManagerService,
          FileCorePictureService,
          AiModelRegistryService,
          UpgradeMigrationService,
          UpgradeSequenceReaderService,
          SdkClientGenerationService,
          PostgresAdvisoryLockService,
          ApplicationUninstallService,
          EventLogRetentionService,
          RoleAssignmentValidationService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    }).compile();

    service = module.get(WorkspaceService);
  });

  const update = (defaultSenderDomain: string | null) =>
    service.updateWorkspaceById({
      payload: { id: workspaceId, defaultSenderDomain },
      userWorkspaceId: 'user-workspace-id',
      apiKey: undefined,
    });

  it('stores a normalized domain', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      true,
    );

    await update(' @Example.COM ');

    expect(workspaceRepository.update).toHaveBeenCalledWith(
      workspaceId,
      expect.objectContaining({ defaultSenderDomain: 'example.com' }),
    );
  });

  it('requires the WORKSPACE permission flag', async () => {
    permissionsService.userHasWorkspaceSettingPermission.mockResolvedValue(
      false,
    );

    await expect(update('example.com')).rejects.toBeInstanceOf(
      PermissionsException,
    );
    expect(
      permissionsService.userHasWorkspaceSettingPermission,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ setting: PermissionFlagType.WORKSPACE }),
    );
    expect(workspaceRepository.update).not.toHaveBeenCalled();
  });
});
