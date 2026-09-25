import { Module } from '@nestjs/common';

import { ApplicationHealthCheckService } from 'src/engine/core-modules/application/application-health/application-health-check.service';
import { ApplicationHealthResolver } from 'src/engine/core-modules/application/application-health/application-health.resolver';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    ApplicationModule,
    LogicFunctionExecutorModule,
    PermissionsModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [ApplicationHealthCheckService, ApplicationHealthResolver],
  exports: [ApplicationHealthCheckService],
})
export class ApplicationHealthModule {}
