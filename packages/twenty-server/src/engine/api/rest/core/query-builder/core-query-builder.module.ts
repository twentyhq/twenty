import { Module } from '@nestjs/common';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { coreQueryBuilderFactories } from 'src/engine/api/rest/core/query-builder/factories/factories';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [AuthModule, DomainManagerModule, WorkspaceCacheStorageModule],
  providers: [...coreQueryBuilderFactories, CoreQueryBuilderFactory],
  exports: [CoreQueryBuilderFactory],
})
export class CoreQueryBuilderModule {}
