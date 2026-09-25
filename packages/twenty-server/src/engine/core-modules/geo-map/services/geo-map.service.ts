import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { AddressAutocompleteDriverFactory } from 'src/engine/core-modules/geo-map/address-autocomplete-driver.factory';
import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';

@Injectable()
export class GeoMapService {
  constructor(
    private readonly addressAutocompleteDriverFactory: AddressAutocompleteDriverFactory,
  ) {}

  public async getAutoCompleteAddress(
    address: string,
    token: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<GeoMapAutocompleteSanitizedResult[]> {
    const driver = this.addressAutocompleteDriverFactory.getCurrentDriver();

    if (!isDefined(driver) || !isNonEmptyString(address?.trim())) {
      return [];
    }

    return driver.getSuggestions({
      query: address,
      sessionToken: token,
      country,
      isCityOnly: isFieldCity,
    });
  }

  public async getAddressDetails(
    placeId: string,
    token: string,
  ): Promise<GeoMapAddressFields> {
    const driver = this.addressAutocompleteDriverFactory.getCurrentDriver();

    if (!isDefined(driver)) {
      return {};
    }

    return driver.getAddressDetails({ placeId, sessionToken: token });
  }
}
