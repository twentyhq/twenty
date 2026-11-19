import { UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { type Request } from 'express';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UpdateFocusedTabInput } from 'src/engine/core-modules/web-push/dtos/update-focused-tab.input';
import { UpsertWebPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-web-push-subscription.input';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
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
export class WebPushResolver {
  constructor(
    private readonly webPushService: WebPushService,
    private readonly userSessionCookieService: UserSessionCookieService,
  ) {}

  @Mutation(() => Boolean)
  async upsertWebPushSubscription(
    @Args('input') input: UpsertWebPushSubscriptionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: { req: Request },
  ): Promise<boolean> {
    await this.webPushService.upsertWebPushSubscription({
      input,
      workspaceId: workspace.id,
      userWorkspaceId,
      sessionToken:
        this.userSessionCookieService.extractSessionTokenFromRequest(
          context.req,
        ),
    });

    return true;
  }

  @Mutation(() => Boolean)
  async updateFocusedTab(
    @Args('input') { tabId, isFocused }: UpdateFocusedTabInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ): Promise<boolean> {
    await this.webPushService.updateFocusedTab({
      workspaceId: workspace.id,
      userId: user.id,
      tabId,
      isFocused,
    });

    return true;
  }
}
