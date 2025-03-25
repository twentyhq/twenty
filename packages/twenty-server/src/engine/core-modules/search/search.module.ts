import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { SearchResolver } from 'src/engine/core-modules/search/search.resolver';
import { SearchService } from 'src/engine/core-modules/search/services/search.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [WorkspaceCacheStorageModule, FeatureFlagModule],
  providers: [SearchResolver, SearchService],
})
export class SearchModule {}
