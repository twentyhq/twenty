import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueRoleEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-role.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxItemResolver } from 'src/engine/core-modules/inbox/resolvers/inbox-item.resolver';
import { InboxSettingsResolver } from 'src/engine/core-modules/inbox/resolvers/inbox-settings.resolver';
import { InboxItemToolCallService } from 'src/engine/core-modules/inbox/services/inbox-item-tool-call.service';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxToolCallExecutionService } from 'src/engine/core-modules/inbox/services/inbox-tool-call-execution.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// Leaf module: producers import it, it imports none of them. That keeps the
// inbox free of cycles with the subsystems that feed it.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InboxItemEntity,
      InboxItemToolCallEntity,
      InboxItemTypeEntity,
      InboxQueueEntity,
      InboxQueueRoleEntity,
      ApplicationEntity,
      RoleEntity,
    ]),
    FeatureFlagModule,
    PermissionsModule,
    UserRoleModule,
    UserWorkspaceModule,
  ],
  providers: [
    InboxItemService,
    InboxItemTypeService,
    InboxQueueService,
    InboxItemToolCallService,
    InboxToolCallExecutionService,
    InboxTransitionService,
    InboxRouterService,
    InboxItemResolver,
    InboxSettingsResolver,
    provideWorkspaceScopedRepository(InboxItemEntity),
    provideWorkspaceScopedRepository(InboxItemToolCallEntity),
    provideWorkspaceScopedRepository(InboxItemTypeEntity),
    provideWorkspaceScopedRepository(InboxQueueEntity),
    provideWorkspaceScopedRepository(InboxQueueRoleEntity),
    provideWorkspaceScopedRepository(RoleEntity),
  ],
  exports: [
    InboxRouterService,
    InboxItemTypeService,
    InboxQueueService,
    InboxTransitionService,
  ],
})
export class InboxModule {}
