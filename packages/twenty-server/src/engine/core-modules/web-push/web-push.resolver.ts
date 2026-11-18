import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { type Request } from 'express';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { DeletePushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/delete-push-subscription.input';
import { UpdateInboxPresenceInput } from 'src/engine/core-modules/web-push/dtos/update-inbox-presence.input';
import { UpsertPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-push-subscription.input';
import { PushSubscriptionService } from 'src/engine/core-modules/web-push/services/push-subscription.service';
import { WebPushPresenceService } from 'src/engine/core-modules/web-push/services/web-push-presence.service';
import { WebPushExceptionFilter } from 'src/engine/core-modules/web-push/web-push-exception-filter';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(WebPushExceptionFilter)
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
    private readonly pushSubscriptionService: PushSubscriptionService,
    private readonly webPushPresenceService: WebPushPresenceService,
    private readonly userSessionCookieService: UserSessionCookieService,
  ) {}

  @Mutation(() => Boolean)
  async upsertPushSubscription(
    @Args('input') input: UpsertPushSubscriptionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: { req: Request },
  ): Promise<boolean> {
    await this.pushSubscriptionService.upsertPushSubscription({
      input,
      workspaceId: workspace.id,
      userWorkspaceId,
      sessionToken:
        this.userSessionCookieService.extractSessionTokenFromRequest(
          context.req,
        ),
      origin: context.req.headers.origin,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async deletePushSubscription(
    @Args('input') { endpoint }: DeletePushSubscriptionInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<boolean> {
    await this.pushSubscriptionService.deletePushSubscription({
      endpoint,
      workspaceId: workspace.id,
      userWorkspaceId,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async updateInboxPresence(
    @Args('input') { tabId, isFocused }: UpdateInboxPresenceInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUser() user: AuthContextUser,
  ): Promise<boolean> {
    await this.webPushPresenceService.updateFocusedTab({
      workspaceId: workspace.id,
      userId: user.id,
      tabId,
      isFocused,
    });

    return true;
  }
}
