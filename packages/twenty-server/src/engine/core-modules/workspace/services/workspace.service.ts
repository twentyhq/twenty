import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { msg } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FileWorkspaceFolderDeletionJob,
  type FileWorkspaceFolderDeletionJobData,
} from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
  WorkspaceNotFoundDefaultError,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/default-feature-flags';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceService extends TypeOrmQueryService<WorkspaceEntity> {
  private readonly featureLookUpKey = BillingEntitlementKey.CUSTOM_DOMAIN;
  protected readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingService: BillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly permissionsService: PermissionsService,
    private readonly dnsManagerService: DnsManagerService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly subdomainManagerService: SubdomainManagerService,
    private readonly customDomainManagerService: CustomDomainManagerService,
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super(workspaceRepository);
  }

  async updateWorkspaceById({
    payload,
    userWorkspaceId,
    apiKey,
  }: {
    payload: Partial<WorkspaceEntity> & { id: string };
    userWorkspaceId?: string;
    apiKey?: string;
  }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.id,
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.validateSecurityPermissions({
      payload,
      userWorkspaceId,
      workspaceId: workspace.id,
      apiKey,
    });

    await this.validateWorkspacePermissions({
      payload,
      userWorkspaceId,
      workspaceId: workspace.id,
      apiKey,
      workspaceActivationStatus: workspace.activationStatus,
    });

    if (payload.subdomain && workspace.subdomain !== payload.subdomain) {
      await this.subdomainManagerService.validateSubdomainOrThrow(
        payload.subdomain,
      );
    }

    let customDomainRegistered = false;

    if (payload.customDomain === null && isDefined(workspace.customDomain)) {
      await this.dnsManagerService.deleteHostnameSilently(
        workspace.customDomain,
      );
      workspace.isCustomDomainEnabled = false;
    }

    if (
      payload.customDomain &&
      workspace.customDomain !== payload.customDomain
    ) {
      await this.customDomainManagerService.setCustomDomain(
        workspace,
        payload.customDomain,
      );
      customDomainRegistered = true;
    }

    const authProvidersBySystem = {
      google: this.twentyConfigService.get('AUTH_GOOGLE_ENABLED'),
      password: this.twentyConfigService.get('AUTH_PASSWORD_ENABLED'),
      microsoft: this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED'),
    };

    if (payload.isGoogleAuthEnabled && !authProvidersBySystem.google) {
      throw new WorkspaceException(
        'Google auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (payload.isMicrosoftAuthEnabled && !authProvidersBySystem.microsoft) {
      throw new WorkspaceException(
        'Microsoft auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (payload.isPasswordAuthEnabled && !authProvidersBySystem.password) {
      throw new WorkspaceException(
        'Password auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }

    try {
      return await this.workspaceRepository.save({
        ...workspace,
        ...payload,
      });
    } catch (error) {
      // revert custom domain registration on error
      if (payload.customDomain && customDomainRegistered) {
        this.dnsManagerService
          .deleteHostnameSilently(payload.customDomain)
          .catch((err) => {
            this.exceptionHandlerService.captureExceptions([err]);
          });
      }
      throw error;
    }
  }

  async activateWorkspace(
    user: UserEntity,
    workspace: WorkspaceEntity,
    data: ActivateWorkspaceInput,
  ) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }

    if (
      workspace.activationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      throw new Error('Workspace is already being created');
    }

    if (
      workspace.activationStatus !== WorkspaceActivationStatus.PENDING_CREATION
    ) {
      throw new Error('Workspace is not pending creation');
    }

    await this.workspaceRepository.update(workspace.id, {
      activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
    });

    await this.featureFlagService.enableFeatureFlags(
      DEFAULT_FEATURE_FLAGS,
      workspace.id,
    );

    await this.workspaceManagerService.init({
      workspaceId: workspace.id,
      userId: user.id,
    });
    await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await this.workspaceRepository.update(workspace.id, {
      displayName: data.displayName,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      version: extractVersionMajorMinorPatch(appVersion),
    });

    return await this.workspaceRepository.findOneBy({
      id: workspace.id,
    });
  }

  async deleteMetadataSchemaCacheAndUserWorkspace(workspace: WorkspaceEntity) {
    await this.userWorkspaceRepository.delete({ workspaceId: workspace.id });

    if (this.billingService.isBillingEnabled()) {
      await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
    }

    await this.workspaceManagerService.delete(workspace.id);

    return workspace;
  }

  async deleteWorkspace(id: string, softDelete = false) {
    //TODO: delete all logs when #611 closed

    this.logger.log(
      `${softDelete ? 'Soft' : 'Hard'} deleting workspace ${id} ...`,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    assert(workspace, 'Workspace not found');

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId: id,
      },
      withDeleted: true,
    });

    for (const userWorkspace of userWorkspaces) {
      await this.handleRemoveWorkspaceMember(
        id,
        userWorkspace.userId,
        softDelete,
      );
    }
    this.logger.log(`workspace ${id} user workspaces deleted`);

    await this.workspaceCacheStorageService.flush(
      workspace.id,
      workspace.metadataVersion,
    );
    await this.flatEntityMapsCacheService.flushFlatEntityMaps({
      workspaceId: workspace.id,
    });
    this.logger.log(`workspace ${id} cache flushed`);

    if (softDelete) {
      if (this.billingService.isBillingEnabled()) {
        await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
      }

      await this.workspaceRepository.softDelete({ id });

      this.logger.log(`workspace ${id} soft deleted`);

      return workspace;
    }

    await this.deleteMetadataSchemaCacheAndUserWorkspace(workspace);

    await this.messageQueueService.add<FileWorkspaceFolderDeletionJobData>(
      FileWorkspaceFolderDeletionJob.name,
      { workspaceId: id },
    );

    if (workspace.customDomain) {
      await this.dnsManagerService.deleteHostnameSilently(
        workspace.customDomain,
      );
      this.logger.log(`workspace ${id} custom domain deleted`);
    }

    await this.workspaceRepository.delete(id);

    this.logger.log(`workspace ${id} hard deleted`);

    return workspace;
  }

  async handleRemoveWorkspaceMember(
    workspaceId: string,
    userId: string,
    softDelete = false,
  ) {
    if (softDelete) {
      await this.userWorkspaceRepository.softDelete({
        userId,
        workspaceId,
      });
    } else {
      await this.userWorkspaceRepository.delete({
        userId,
        workspaceId,
      });
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        userId,
      },
    });

    if (userWorkspaces.length === 0) {
      await this.userRepository.softDelete(userId);
    }
  }

  private async validateSecurityPermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
  }: {
    payload: Partial<WorkspaceEntity>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey?: string;
  }) {
    if (
      'isGoogleAuthEnabled' in payload ||
      'isMicrosoftAuthEnabled' in payload ||
      'isPasswordAuthEnabled' in payload ||
      'isPublicInviteLinkEnabled' in payload
    ) {
      if (!userWorkspaceId) {
        throw new Error('Missing userWorkspaceId in authContext');
      }

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          setting: PermissionFlagType.SECURITY,
          workspaceId: workspaceId,
          apiKeyId: apiKey,
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to manage security settings. Please contact your workspace administrator.`,
          },
        );
      }
    }
  }

  private async validateWorkspacePermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
    workspaceActivationStatus,
  }: {
    payload: Partial<WorkspaceEntity>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey?: string;
    workspaceActivationStatus: WorkspaceActivationStatus;
  }) {
    if (
      'displayName' in payload ||
      'subdomain' in payload ||
      'customDomain' in payload ||
      'logo' in payload ||
      'trashRetentionDays' in payload
    ) {
      if (!userWorkspaceId) {
        throw new Error('Missing userWorkspaceId in authContext');
      }

      if (
        workspaceActivationStatus === WorkspaceActivationStatus.PENDING_CREATION
      ) {
        return;
      }

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          workspaceId,
          setting: PermissionFlagType.WORKSPACE,
          apiKeyId: apiKey,
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to manage workspace settings. Please contact your workspace administrator.`,
          },
        );
      }
    }
  }
}
