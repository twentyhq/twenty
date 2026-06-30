import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { GeoMapResolver } from 'src/engine/core-modules/geo-map/resolver/geo-map.resolver';
import { GeoMapService } from 'src/engine/core-modules/geo-map/services/geo-map.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [WorkspaceCacheStorageModule, TokenModule, SecureHttpClientModule],
  providers: [GeoMapService, GeoMapResolver],
  exports: [],
})
export class GeoMapModule {}
