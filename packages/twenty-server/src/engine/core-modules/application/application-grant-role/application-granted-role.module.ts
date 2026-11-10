import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationGrantedRoleService } from 'src/engine/core-modules/application/application-grant-role/services/application-granted-role.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, CoreEntityCacheModule],
  providers: [ApplicationGrantedRoleService],
  exports: [ApplicationGrantedRoleService],
})
export class ApplicationGrantedRoleModule {}
