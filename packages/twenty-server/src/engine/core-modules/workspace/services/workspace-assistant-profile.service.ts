import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isUndefined } from '@sniptt/guards';
import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FeatureFlagKey } from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
  WorkspaceNotFoundDefaultError,
} from 'src/engine/core-modules/workspace/workspace.exception';
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

  async preparePatch({
    workspace,
    profile,
  }: {
    workspace: Pick<WorkspaceEntity, 'id' | 'activationStatus'>;
    profile: unknown;
  }) {
    if (isUndefined(profile)) {
      return undefined;
    }

    await this.assertCanChangeProfile(workspace);

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

    return result.data;
  }

  async updateWorkspace({
    workspaceId,
    values,
    patch,
  }: {
    workspaceId: string;
    values: QueryDeepPartialEntity<WorkspaceEntity>;
    patch: Partial<AiChatAssistantProfile> | undefined;
  }) {
    if (isUndefined(patch)) {
      return this.workspaceRepository.update(workspaceId, values);
    }

    return this.workspaceRepository
      .createQueryBuilder()
      .update()
      .set({
        ...values,
        aiChatAssistantProfile: () =>
          doNotTranslate(
            '"aiChatAssistantProfile" || :assistantProfilePatch::jsonb',
          ),
      })
      .where({ id: workspaceId })
      .setParameters({ assistantProfilePatch: JSON.stringify(patch) })
      .execute();
  }

  async reset(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.assertCanChangeProfile(workspace);
    await this.workspaceRepository.update(workspaceId, {
      aiChatAssistantProfile: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    });
    await this.coreEntityCacheService.invalidate(
      'workspaceEntity',
      workspaceId,
    );

    const updatedWorkspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    assertIsDefinedOrThrow(updatedWorkspace, WorkspaceNotFoundDefaultError);

    return updatedWorkspace;
  }

  async get(workspace: Pick<WorkspaceEntity, 'id' | 'aiChatAssistantProfile'>) {
    if (isDefined(workspace.aiChatAssistantProfile)) {
      return workspace.aiChatAssistantProfile;
    }

    await this.coreEntityCacheService.invalidateAndRecompute(
      'workspaceEntity',
      workspace.id,
    );

    const refreshedWorkspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspace.id,
    );

    assertIsDefinedOrThrow(refreshedWorkspace, WorkspaceNotFoundDefaultError);

    return refreshedWorkspace.aiChatAssistantProfile;
  }

  private async assertCanChangeProfile(
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

    const hasPermission =
      await this.settingPermissionsService.hasPermissionFlag({
        authContext: workspaceAuthContextStorage.getStore(),
        permissionFlag: PermissionFlagType.AI_SETTINGS,
      });

    if (!hasPermission) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`You do not have permission to update the assistant profile. Please contact your workspace administrator.`,
        },
      );
    }

    const isInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      workspace.id,
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
