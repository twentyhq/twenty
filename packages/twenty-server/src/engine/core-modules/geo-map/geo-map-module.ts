import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { AddressAutocompleteDriverFactory } from 'src/engine/core-modules/geo-map/address-autocomplete-driver.factory';
import { GeoMapResolver } from 'src/engine/core-modules/geo-map/resolver/geo-map.resolver';
import { GeoMapService } from 'src/engine/core-modules/geo-map/services/geo-map.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [
    WorkspaceCacheStorageModule,
    TokenModule,
    SecureHttpClientModule,
    TwentyConfigModule,
  ],
  providers: [AddressAutocompleteDriverFactory, GeoMapService, GeoMapResolver],
  exports: [],
})
export class GeoMapModule {}
