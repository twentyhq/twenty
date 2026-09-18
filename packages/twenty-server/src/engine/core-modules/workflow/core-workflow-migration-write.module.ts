import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { CoreWorkflowMigrationWriteService } from 'src/engine/core-modules/workflow/services/core-workflow-migration-write.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [CoreWorkflowMigrationWriteService],
  exports: [
    CoreWorkflowMigrationWriteService,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    ApplicationModule,
  ],
})
export class CoreWorkflowMigrationWriteModule {}
