import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { type Request } from 'express';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UpdateInboxNotificationSettingsInput } from 'src/engine/core-modules/web-push/dtos/update-inbox-notification-settings.input';
import { UpsertWebPushSubscriptionInput } from 'src/engine/core-modules/web-push/dtos/upsert-web-push-subscription.input';
import { WebPushGraphqlApiExceptionFilter } from 'src/engine/core-modules/web-push/filters/web-push-graphql-api-exception.filter';
import { WebPushService } from 'src/engine/core-modules/web-push/services/web-push.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UsePipes(ResolverValidationPipe)
@UseFilters(WebPushGraphqlApiExceptionFilter)
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
    private readonly userWorkspaceService: UserWorkspaceService,
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

  @Mutation(() => UserWorkspaceEntity)
  async updateInboxNotificationSettings(
    @Args('input')
    {
      inboxNotificationLevel,
      isInboxNotificationPreviewEnabled,
    }: UpdateInboxNotificationSettingsInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<UserWorkspaceEntity> {
    return this.userWorkspaceService.updateInboxNotificationSettings({
      workspaceId: workspace.id,
      userWorkspaceId,
      inboxNotificationLevel,
      isInboxNotificationPreviewEnabled,
    });
  }
}
