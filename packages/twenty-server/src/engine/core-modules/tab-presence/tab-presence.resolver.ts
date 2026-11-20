import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

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

@UsePipes(ResolverValidationPipe)
@UseGuards(
  AccessPolicyGuard({
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
    requiredPermissionFlags: [],
    requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
  }),
)
@MetadataResolver()
export class TabPresenceResolver {
  constructor(private readonly tabPresenceService: TabPresenceService) {}

  @Mutation(() => Boolean)
  async updateTabPresence(
    @Args('input') { tabId, state }: UpdateTabPresenceInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
  ): Promise<boolean> {
    await this.tabPresenceService.updateTabPresence({
      workspaceId: workspace.id,
      workspaceMemberId,
      tabId,
      state,
    });

    return true;
  }

  @Query(() => [UUIDScalarType])
  async onlineWorkspaceMemberIds(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string[]> {
    return this.tabPresenceService.findOnlineWorkspaceMemberIds(workspace.id);
  }
}
