import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role-lookup/services/application-grant-role-lookup.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    WorkspaceCacheModule,
    CoreEntityCacheModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [ApplicationGrantRoleLookupService],
  exports: [ApplicationGrantRoleLookupService],
})
export class ApplicationGrantRoleLookupModule {}
