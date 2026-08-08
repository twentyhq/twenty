import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueMemberEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-member.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxItemResolver } from 'src/engine/core-modules/inbox/resolvers/inbox-item.resolver';
import { InboxItemActionService } from 'src/engine/core-modules/inbox/services/inbox-item-action.service';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { InboxTransitionService } from 'src/engine/core-modules/inbox/services/inbox-transition.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// Leaf module: producers import it, it imports none of them. That keeps the
// inbox free of cycles with the subsystems that feed it.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InboxItemEntity,
      InboxItemTypeEntity,
      InboxQueueEntity,
      InboxQueueMemberEntity,
      ApplicationEntity,
    ]),
    FeatureFlagModule,
  ],
  providers: [
    InboxItemService,
    InboxItemTypeService,
    InboxQueueService,
    InboxItemActionService,
    InboxTransitionService,
    InboxRouterService,
    InboxItemResolver,
    provideWorkspaceScopedRepository(InboxItemEntity),
    provideWorkspaceScopedRepository(InboxItemTypeEntity),
    provideWorkspaceScopedRepository(InboxQueueEntity),
    provideWorkspaceScopedRepository(InboxQueueMemberEntity),
  ],
  exports: [
    InboxRouterService,
    InboxItemTypeService,
    InboxQueueService,
    InboxTransitionService,
  ],
})
export class InboxModule {}
