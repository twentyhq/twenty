import { Module } from '@nestjs/common';

import { AddressAutocompleteDriverFactory } from 'src/engine/core-modules/geo-map/address-autocomplete-driver.factory';
import { GeoMapResolver } from 'src/engine/core-modules/geo-map/resolver/geo-map.resolver';
import { GeoMapService } from 'src/engine/core-modules/geo-map/services/geo-map.service';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';

@Module({
  imports: [SecureHttpClientModule],
  providers: [AddressAutocompleteDriverFactory, GeoMapService, GeoMapResolver],
  exports: [],
})
export class GeoMapModule {}
