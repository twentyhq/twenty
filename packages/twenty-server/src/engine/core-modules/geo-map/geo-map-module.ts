import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { GeoMapResolver } from 'src/engine/core-modules/geo-map/resolver/geo-map.resolver';
import { GeoMapService } from 'src/engine/core-modules/geo-map/services/geo-map.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [HttpModule, WorkspaceCacheStorageModule, TokenModule],
  providers: [GeoMapService, GeoMapResolver],
  exports: [],
})
export class GeoMapModule {}
