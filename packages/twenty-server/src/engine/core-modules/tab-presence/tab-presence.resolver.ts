import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UpdateTabPresenceInput } from 'src/engine/core-modules/tab-presence/dtos/update-tab-presence.input';
import { TabPresenceService } from 'src/engine/core-modules/tab-presence/services/tab-presence.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

const UPDATE_TAB_PRESENCE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: false,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.AI],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
};

const ONLINE_WORKSPACE_MEMBER_IDS_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [PermissionFlagType.AI],
  requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
};

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class TabPresenceResolver {
  constructor(private readonly tabPresenceService: TabPresenceService) {}

  @Mutation(() => Boolean)
  @UseGuards(AccessPolicyGuard(UPDATE_TAB_PRESENCE_ACCESS_POLICY))
  async updateTabPresence(
    @Args('input') { tabId, status }: UpdateTabPresenceInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<boolean> {
    await this.tabPresenceService.updateTabPresence({
      workspaceId: workspace.id,
      workspaceMemberId,
      tabId,
      status,
    });

    return true;
  }

  @Query(() => [UUIDScalarType])
  @UseGuards(AccessPolicyGuard(ONLINE_WORKSPACE_MEMBER_IDS_ACCESS_POLICY))
  async onlineWorkspaceMemberIds(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string[]> {
    return this.tabPresenceService.findOnlineWorkspaceMemberIds(workspace.id);
  }
}
