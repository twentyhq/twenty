import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GlobalSearchResolver } from 'src/engine/core-modules/global-search/global-search.resolver';
import { GlobalSearchService } from 'src/engine/core-modules/global-search/services/global-search.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [WorkspaceCacheStorageModule, FeatureFlagModule],
  providers: [GlobalSearchResolver, GlobalSearchService],
})
export class GlobalSearchModule {}
