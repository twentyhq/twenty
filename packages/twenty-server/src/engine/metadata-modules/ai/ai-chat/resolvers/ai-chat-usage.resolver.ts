import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { AiChatUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-usage.dto';
import { AiChatUserCreditsUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-user-credits-usage.dto';
import { AiChatUsageService } from 'src/engine/metadata-modules/ai/ai-chat/services/ai-chat-usage.service';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';

@MetadataResolver(() => AiChatUsageDTO)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class AiChatUsageResolver {
  constructor(
    private readonly aiChatUsageService: AiChatUsageService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  @Query(() => AiChatUsageDTO, { nullable: true })
  async aiChatUsage(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AiChatUsageDTO | null> {
    return this.aiChatUsageService.findUsage({ workspaceId, userWorkspaceId });
  }

  @Query(() => AiChatUserCreditsUsageDTO, { nullable: true })
  async aiChatUserCreditsUsage(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AiChatUserCreditsUsageDTO | null> {
    return this.usageLimitQuotaService.getUserAllowanceUsage({
      workspaceId,
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });
  }
}
