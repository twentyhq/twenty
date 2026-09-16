import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { InboxItemRecordEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-record.entity';
import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueRoleEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-role.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxItemResolver } from 'src/engine/core-modules/inbox/resolvers/inbox-item.resolver';
import { InboxSettingsResolver } from 'src/engine/core-modules/inbox/resolvers/inbox-settings.resolver';
import { InboxItemToolCallService } from 'src/engine/core-modules/inbox/services/inbox-item-tool-call.service';
import { InboxToolCallExecutionService } from 'src/engine/core-modules/inbox/services/inbox-tool-call-execution.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { ToolProviderModule } from 'src/engine/core-modules/tool-provider/tool-provider.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// Producers import the inbox and it imports none of them, except the tool
// registry it has to reach back into to run an approved plan. That one edge is
// the cycle forwardRef exists for.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InboxItemEntity,
      InboxItemRecordEntity,
      InboxItemToolCallEntity,
      InboxQueueEntity,
      InboxQueueRoleEntity,
      ApplicationEntity,
      MessageChannelEntity,
      RoleEntity,
    ]),
    FeatureFlagModule,
    PermissionsModule,
    UserRoleModule,
    UserWorkspaceModule,
    AiAgentExecutionModule,
    forwardRef(() => ToolProviderModule),
  ],
  providers: [
    InboxItemService,
    InboxQueueService,
    InboxItemToolCallService,
    InboxToolCallExecutionService,
    InboxTransitionService,
    InboxRouterService,
    InboxItemResolver,
    InboxSettingsResolver,
    provideWorkspaceScopedRepository(InboxItemEntity),
    provideWorkspaceScopedRepository(InboxItemRecordEntity),
    provideWorkspaceScopedRepository(InboxItemToolCallEntity),
    provideWorkspaceScopedRepository(InboxQueueEntity),
    provideWorkspaceScopedRepository(InboxQueueRoleEntity),
    provideWorkspaceScopedRepository(RoleEntity),
  ],
  exports: [InboxRouterService, InboxQueueService, InboxTransitionService],
})
export class InboxModule {}
