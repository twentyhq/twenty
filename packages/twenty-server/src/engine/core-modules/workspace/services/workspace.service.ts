import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { msg } from '@lingui/core/macro';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { CustomDomainManagerService } from 'src/engine/core-modules/domain/custom-domain-manager/services/custom-domain-manager.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
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
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/default-feature-flags';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceService extends TypeOrmQueryService<WorkspaceEntity> {
  protected readonly logger = new Logger(WorkspaceService.name);

  private readonly WORKSPACE_FIELD_PERMISSIONS: Record<
    string,
    PermissionFlagType
  > = {
    subdomain: PermissionFlagType.WORKSPACE,
    customDomain: PermissionFlagType.WORKSPACE,
    displayName: PermissionFlagType.WORKSPACE,
    logo: PermissionFlagType.WORKSPACE,
    trashRetentionDays: PermissionFlagType.WORKSPACE,
    inviteHash: PermissionFlagType.WORKSPACE_MEMBERS,
    isPublicInviteLinkEnabled: PermissionFlagType.SECURITY,
    allowImpersonation: PermissionFlagType.SECURITY,
    isGoogleAuthEnabled: PermissionFlagType.SECURITY,
    isMicrosoftAuthEnabled: PermissionFlagType.SECURITY,
    isPasswordAuthEnabled: PermissionFlagType.SECURITY,
    editableProfileFields: PermissionFlagType.SECURITY,
    isTwoFactorAuthenticationEnforced: PermissionFlagType.SECURITY,
    defaultRoleId: PermissionFlagType.ROLES,
    fastModel: PermissionFlagType.WORKSPACE,
    smartModel: PermissionFlagType.WORKSPACE,
  };

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
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
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
    apiKey: ApiKeyEntity | undefined;
  }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.id,
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.validateWorkspaceUpdatePermissions({
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
    if (payload.isGoogleAuthBypassEnabled && !authProvidersBySystem.google) {
      throw new WorkspaceException(
        'Google auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (
      payload.isMicrosoftAuthBypassEnabled &&
      !authProvidersBySystem.microsoft
    ) {
      throw new WorkspaceException(
        'Microsoft auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (
      payload.isPasswordAuthBypassEnabled &&
      !authProvidersBySystem.password
    ) {
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

    const isV2SyncEnabled = this.twentyConfigService.get(
      'IS_WORKSPACE_CREATION_V2_ENABLED',
    );

    await this.featureFlagService.enableFeatureFlags(
      [
        ...DEFAULT_FEATURE_FLAGS,
        ...(isV2SyncEnabled
          ? [FeatureFlagKey.IS_WORKSPACE_CREATION_V2_ENABLED]
          : []),
      ],
      workspace.id,
    );

    await this.workspaceManagerService.init({
      workspace,
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

  /**
   * @deprecated Should be removed once AddWorkspaceForeignKeysMigrationCommand has been run successfully in production
   * As we will be able to rely on foreignKey delete cascading
   */
  async deleteMetadataSchemaCacheAndUserWorkspace(workspace: WorkspaceEntity) {
    await this.userWorkspaceService.deleteUserWorkspace({
      userWorkspaceId: workspace.id,
    });

    await this.workspaceManagerService.delete(workspace.id);

    return workspace;
  }

  async deleteWorkspace(id: string, softDelete = false) {
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

    if (this.billingService.isBillingEnabled()) {
      await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
    }

    if (softDelete) {
      await this.workspaceRepository.softDelete({ id });

      this.logger.log(`workspace ${id} soft deleted`);

      return workspace;
    }

    await this.deleteMetadataSchemaCacheAndUserWorkspace(workspace);

    await this.workspaceDataSourceService.deleteWorkspaceDBSchema(workspace.id);

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
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        userId,
      },
    });

    const userWorkspaceOfRemovedWorkspaceMember = userWorkspaces?.find(
      (userWorkspace: UserWorkspaceEntity) =>
        userWorkspace.workspaceId === workspaceId,
    );

    if (isDefined(userWorkspaceOfRemovedWorkspaceMember)) {
      await this.userWorkspaceService.deleteUserWorkspace({
        userWorkspaceId: userWorkspaceOfRemovedWorkspaceMember.id,
        softDelete,
      });
    }

    const hasOtherUserWorkspaces = isDefined(
      userWorkspaceOfRemovedWorkspaceMember,
    )
      ? userWorkspaces.length > 1
      : userWorkspaces.length > 0;

    if (!hasOtherUserWorkspaces) {
      await this.userRepository.softDelete(userId);
    }
  }

  private async validateWorkspaceUpdatePermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
    workspaceActivationStatus,
  }: {
    payload: Partial<WorkspaceEntity>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey: ApiKeyEntity | undefined;
    workspaceActivationStatus: WorkspaceActivationStatus;
  }) {
    if (
      workspaceActivationStatus === WorkspaceActivationStatus.PENDING_CREATION
    ) {
      return;
    }

    const systemFields = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt']);

    const fieldsBeingUpdated = Object.keys(payload).filter(
      (field) => !systemFields.has(field),
    );

    if (fieldsBeingUpdated.length === 0) {
      return;
    }

    if (!userWorkspaceId) {
      throw new Error('Missing userWorkspaceId in authContext');
    }

    const fieldsByPermission = new Map<PermissionFlagType, string[]>();

    for (const field of fieldsBeingUpdated) {
      const requiredPermission = this.WORKSPACE_FIELD_PERMISSIONS[field];

      if (!requiredPermission) {
        throw new PermissionsException(
          `Field "${field}" is not allowed to be updated`,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`The field "${field}" cannot be updated. Please contact your workspace administrator.`,
          },
        );
      }

      if (!fieldsByPermission.has(requiredPermission)) {
        fieldsByPermission.set(requiredPermission, []);
      }
      fieldsByPermission.get(requiredPermission)!.push(field);
    }

    for (const [permission, fields] of fieldsByPermission.entries()) {
      const hasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          workspaceId,
          setting: permission,
          apiKeyId: apiKey?.id,
        });

      if (!hasPermission) {
        const fieldsList = fields.join(', ');

        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
          {
            userFriendlyMessage: msg`You do not have permission to update these fields: ${fieldsList}. Please contact your workspace administrator.`,
          },
        );
      }
    }
  }
}
