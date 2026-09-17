import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { AddressAutocompleteProvider } from 'src/engine/core-modules/geo-map/enums/address-autocomplete-provider.enum';
import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';
import { type GeoMapBanFeature } from 'src/engine/core-modules/geo-map/types/geo-map-ban-feature.type';
import { sanitizeAutocompleteResults } from 'src/engine/core-modules/geo-map/utils/sanitize-autocomplete-results.util';
import { sanitizeBanAddressDetails } from 'src/engine/core-modules/geo-map/utils/sanitize-ban-address-details.util';
import { sanitizeBanAutocompleteResults } from 'src/engine/core-modules/geo-map/utils/sanitize-ban-autocomplete-results.util';
import { sanitizePlaceDetailsResults } from 'src/engine/core-modules/geo-map/utils/sanitize-place-details-results.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const BAN_SEARCH_URL = 'https://data.geopf.fr/geocodage/search';
const BAN_COUNTRY_CODE = 'FR';
const BAN_RESULTS_LIMIT = 5;
// The BAN rejects (HTTP 400) queries outside 3-200 chars or not starting with a letter or digit.
const BAN_MIN_QUERY_LENGTH = 3;
const BAN_MAX_QUERY_LENGTH = 200;
const BAN_QUERY_FIRST_CHAR_REGEX = /^[\p{L}\p{N}]/u;

@Injectable()
export class GeoMapService {
  private readonly isEnabled: boolean;
  private readonly provider: AddressAutocompleteProvider;
  private readonly googleMapApiKey: string | undefined;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {
    this.isEnabled = this.twentyConfigService.get(
      'IS_MAPS_AND_ADDRESS_AUTOCOMPLETE_ENABLED',
    );
    this.provider = this.twentyConfigService.get(
      'ADDRESS_AUTOCOMPLETE_PROVIDER',
    );
    this.googleMapApiKey = this.twentyConfigService.get('GOOGLE_MAP_API_KEY');
  }

  public async getAutoCompleteAddress(
    address: string,
    token: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<GeoMapAutocompleteSanitizedResult[]> {
    if (!this.isEnabled || !isNonEmptyString(address?.trim())) {
      return [];
    }

    if (this.provider === AddressAutocompleteProvider.BAN) {
      return this.getBanAutoCompleteAddress(address, country, isFieldCity);
    }

    return this.getGoogleAutoCompleteAddress(
      address,
      token,
      country,
      isFieldCity,
    );
  }

  public async getAddressDetails(
    placeId: string,
    token: string,
  ): Promise<GeoMapAddressFields> {
    if (!this.isEnabled) {
      return {};
    }

    if (this.provider === AddressAutocompleteProvider.BAN) {
      return this.getBanAddressDetails(placeId);
    }

    return this.getGoogleAddressDetails(placeId, token);
  }

  private async getGoogleAutoCompleteAddress(
    address: string,
    token: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<GeoMapAutocompleteSanitizedResult[]> {
    if (!isNonEmptyString(this.googleMapApiKey)) {
      return [];
    }

    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&sessiontoken=${token}&key=${this.googleMapApiKey}`;

    if (isNonEmptyString(country)) {
      url += `&components=country:${country}`;
    }
    if (isFieldCity === true) {
      url += `&types=(cities)`;
    }
    const httpClient = this.secureHttpClientService.getHttpClient();

    const result = await httpClient.get(url);

    if (result.data.status === 'OK') {
      return sanitizeAutocompleteResults(result.data.predictions);
    }

    return [];
  }

  private async getGoogleAddressDetails(
    placeId: string,
    token: string,
  ): Promise<GeoMapAddressFields> {
    if (!isNonEmptyString(this.googleMapApiKey)) {
      return {};
    }

    const httpClient = this.secureHttpClientService.getHttpClient();

    const result = await httpClient.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&sessiontoken=${token}&fields=address_components%2Cgeometry&key=${this.googleMapApiKey}`,
    );

    if (result.data.status === 'OK') {
      return sanitizePlaceDetailsResults({
        addressComponents: result.data.result?.address_components,
        location: result.data.result?.geometry?.location,
      });
    }

    return {};
  }

  private async getBanAutoCompleteAddress(
    address: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<GeoMapAutocompleteSanitizedResult[]> {
    if (isNonEmptyString(country) && country !== BAN_COUNTRY_CODE) {
      return [];
    }

    return sanitizeBanAutocompleteResults(
      await this.searchBan(address, isFieldCity),
    );
  }

  // The placeId is the label picked from the autocomplete, re-searched here because the BAN has no lookup-by-id endpoint.
  private async getBanAddressDetails(
    label: string,
  ): Promise<GeoMapAddressFields> {
    const features = await this.searchBan(label);
    const exactMatch = features.find(
      (feature) => feature.properties.label === label,
    );

    return sanitizeBanAddressDetails(exactMatch ?? features[0]);
  }

  private async searchBan(
    query: string,
    isFieldCity?: boolean,
  ): Promise<GeoMapBanFeature[]> {
    const trimmedQuery = query.trim().slice(0, BAN_MAX_QUERY_LENGTH);

    if (
      trimmedQuery.length < BAN_MIN_QUERY_LENGTH ||
      !BAN_QUERY_FIRST_CHAR_REGEX.test(trimmedQuery)
    ) {
      return [];
    }

    const searchParams = new URLSearchParams({
      q: trimmedQuery,
      limit: String(BAN_RESULTS_LIMIT),
    });

    if (isFieldCity === true) {
      searchParams.set('type', 'municipality');
    }

    const httpClient = this.secureHttpClientService.getHttpClient();

    const result = await httpClient.get(
      `${BAN_SEARCH_URL}?${searchParams.toString()}`,
    );

    return result.data?.features ?? [];
  }
}
