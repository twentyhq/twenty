import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isUndefined } from '@sniptt/guards';
import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
} from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FeatureFlagKey } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  removeUndefinedFields,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
  WorkspaceNotFoundDefaultError,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { classifyWorkspaceAuthContext } from 'src/engine/guards/utils/classify-workspace-auth-context.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

@Injectable()
export class WorkspaceAssistantProfileService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async validateProfileUpdateOrThrow({
    workspace,
    profile,
  }: {
    workspace: Pick<WorkspaceEntity, 'id' | 'aiChatAssistantProfile'>;
    profile: unknown;
  }) {
    if (isUndefined(profile)) {
      return undefined;
    }

    this.assertProfileSessionOrThrow();
    await this.assertInboxEnabledOrThrow(workspace.id);

    const result = getAiChatAssistantProfileSchema()
      .partial()
      .strict()
      .safeParse(profile);

    if (!result.success) {
      throw new WorkspaceException(
        doNotTranslate('Invalid assistant profile'),
        WorkspaceExceptionCode.AI_CHAT_ASSISTANT_PROFILE_NOT_VALID,
      );
    }

    return {
      ...workspace.aiChatAssistantProfile,
      ...removeUndefinedFields(result.data),
    };
  }

  async reset(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.assertCanChangeProfileOrThrow(workspace);
    await this.workspaceRepository.update(workspaceId, {
      aiChatAssistantProfile: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    });
    await this.coreEntityCacheService.invalidate(
      'workspaceEntity',
      workspaceId,
    );

    return DEFAULT_AI_CHAT_ASSISTANT_PROFILE;
  }

  private async assertCanChangeProfileOrThrow(
    workspace: Pick<WorkspaceEntity, 'id' | 'activationStatus'>,
  ) {
    if (
      workspace.activationStatus === WorkspaceActivationStatus.PENDING_CREATION
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`The assistant profile cannot be updated before the workspace is activated.`,
        },
      );
    }

    const authContext = this.assertProfileSessionOrThrow();
    const hasPermission =
      await this.settingPermissionsService.hasPermissionFlag({
        authContext,
        permissionFlag: PermissionFlagType.AI_SETTINGS,
      });

    if (!hasPermission) {
      throw this.createProfilePermissionDeniedException();
    }

    await this.assertInboxEnabledOrThrow(workspace.id);
  }

  private assertProfileSessionOrThrow() {
    const authContext = workspaceAuthContextStorage.getStore();

    if (
      !isDefined(authContext) ||
      !isUserAuthContext(authContext) ||
      classifyWorkspaceAuthContext(authContext)?.kind !== 'userSession'
    ) {
      throw this.createProfilePermissionDeniedException();
    }

    return authContext;
  }

  private createProfilePermissionDeniedException() {
    return new PermissionsException(
      PermissionsExceptionMessage.PERMISSION_DENIED,
      PermissionsExceptionCode.PERMISSION_DENIED,
      {
        userFriendlyMessage: msg`You do not have permission to update the assistant profile. Please contact your workspace administrator.`,
      },
    );
  }

  private async assertInboxEnabledOrThrow(workspaceId: string) {
    const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      workspaceId,
    );

    if (!isInboxEnabled) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        { userFriendlyMessage: msg`Inbox is not enabled for this workspace.` },
      );
    }
  }
}
