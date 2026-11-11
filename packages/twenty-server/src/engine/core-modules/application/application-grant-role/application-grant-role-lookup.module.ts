import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationGrantRoleLookupService } from 'src/engine/core-modules/application/application-grant-role/services/application-grant-role-lookup.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, CoreEntityCacheModule],
  providers: [ApplicationGrantRoleLookupService],
  exports: [ApplicationGrantRoleLookupService],
})
export class ApplicationGrantRoleLookupModule {}
