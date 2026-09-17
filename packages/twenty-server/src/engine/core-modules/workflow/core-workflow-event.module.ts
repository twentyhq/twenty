import { Module } from '@nestjs/common';

import { CoreWorkflowEventService } from 'src/engine/core-modules/workflow/services/core-workflow-event.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [CoreWorkflowEventService],
  exports: [CoreWorkflowEventService],
})
export class CoreWorkflowEventModule {}
