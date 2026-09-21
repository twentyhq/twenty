import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { CoreWorkflowAccessModule } from 'src/engine/core-modules/workflow/core-workflow-access.module';
import { CoreWorkflowFavoriteTargetService } from 'src/engine/core-modules/workflow/services/core-workflow-favorite-target.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity]),
    CoreWorkflowAccessModule,
  ],
  providers: [
    CoreWorkflowFavoriteTargetService,
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [CoreWorkflowFavoriteTargetService],
})
export class CoreWorkflowFavoriteTargetModule {}
