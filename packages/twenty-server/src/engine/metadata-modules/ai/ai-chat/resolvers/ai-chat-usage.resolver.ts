import { UseFilters, UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { AiChatUsageDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-usage.dto';
import { AiChatUsageService } from 'src/engine/metadata-modules/ai/ai-chat/services/ai-chat-usage.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver(() => AiChatUsageDTO)
@UseGuards(WorkspaceAuthGuard, SettingsPermissionGuard(PermissionFlagType.AI))
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class AiChatUsageResolver {
  constructor(private readonly aiChatUsageService: AiChatUsageService) {}

  @Query(() => AiChatUsageDTO, { nullable: true })
  async aiChatUsage(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<AiChatUsageDTO | null> {
    return this.aiChatUsageService.findUsage({ workspaceId, userWorkspaceId });
  }
}
