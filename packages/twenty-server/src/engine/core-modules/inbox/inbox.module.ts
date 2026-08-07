import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxItemResolver } from 'src/engine/core-modules/inbox/resolvers/inbox-item.resolver';
import { InboxItemActionService } from 'src/engine/core-modules/inbox/services/inbox-item-action.service';
import { InboxItemTypeService } from 'src/engine/core-modules/inbox/services/inbox-item-type.service';
import { InboxItemService } from 'src/engine/core-modules/inbox/services/inbox-item.service';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

// Leaf module: producers import it, it imports none of them. That keeps the
// inbox free of cycles with the subsystems that feed it.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InboxItemEntity,
      InboxItemTypeEntity,
      ApplicationEntity,
    ]),
    FeatureFlagModule,
  ],
  providers: [
    InboxItemService,
    InboxItemTypeService,
    InboxItemActionService,
    InboxRouterService,
    InboxItemResolver,
    provideWorkspaceScopedRepository(InboxItemEntity),
    provideWorkspaceScopedRepository(InboxItemTypeEntity),
  ],
  exports: [InboxRouterService, InboxItemTypeService],
})
export class InboxModule {}
