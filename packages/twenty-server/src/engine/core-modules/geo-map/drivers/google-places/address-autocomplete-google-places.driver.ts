import { type AxiosInstance } from 'axios';
import { isNonEmptyString } from '@sniptt/guards';

import {
  type AddressAutocompleteDetailsInput,
  type AddressAutocompleteDriver,
  type AddressAutocompleteSuggestionsInput,
} from 'src/engine/core-modules/geo-map/drivers/types/address-autocomplete-driver.type';
import { sanitizeAddressAutocompleteGooglePlacesAddressDetails } from 'src/engine/core-modules/geo-map/drivers/google-places/utils/sanitize-address-autocomplete-google-places-address-details.util';
import { sanitizeAddressAutocompleteGooglePlacesSuggestions } from 'src/engine/core-modules/geo-map/drivers/google-places/utils/sanitize-address-autocomplete-google-places-suggestions.util';
import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';

const ADDRESS_AUTOCOMPLETE_GOOGLE_PLACES_API_URL =
  'https://maps.googleapis.com/maps/api/place';

export class AddressAutocompleteGooglePlacesDriver implements AddressAutocompleteDriver {
  constructor(
    private readonly apiKey: string,
    private readonly httpClient: AxiosInstance,
  ) {}

  async getSuggestions({
    query,
    sessionToken,
    country,
    isCityOnly,
  }: AddressAutocompleteSuggestionsInput): Promise<
    GeoMapAutocompleteSanitizedResult[]
  > {
    const searchParams = new URLSearchParams({
      input: query,
      key: this.apiKey,
    });

    if (isNonEmptyString(sessionToken)) {
      searchParams.set('sessiontoken', sessionToken);
    }

    if (isNonEmptyString(country)) {
      searchParams.set('components', `country:${country}`);
    }

    if (isCityOnly === true) {
      searchParams.set('types', '(cities)');
    }

    const result = await this.httpClient.get(
      `${ADDRESS_AUTOCOMPLETE_GOOGLE_PLACES_API_URL}/autocomplete/json?${searchParams.toString()}`,
    );

    if (result.data.status !== 'OK') {
      return [];
    }

    return sanitizeAddressAutocompleteGooglePlacesSuggestions(
      result.data.predictions,
    );
  }

  async getAddressDetails({
    placeId,
    sessionToken,
  }: AddressAutocompleteDetailsInput): Promise<GeoMapAddressFields> {
    const searchParams = new URLSearchParams({
      place_id: placeId,
      fields: 'address_components,geometry',
      key: this.apiKey,
    });

    if (isNonEmptyString(sessionToken)) {
      searchParams.set('sessiontoken', sessionToken);
    }

    const result = await this.httpClient.get(
      `${ADDRESS_AUTOCOMPLETE_GOOGLE_PLACES_API_URL}/details/json?${searchParams.toString()}`,
    );

    if (result.data.status !== 'OK') {
      return {};
    }

    return sanitizeAddressAutocompleteGooglePlacesAddressDetails({
      addressComponents: result.data.result?.address_components,
      location: result.data.result?.geometry?.location,
    });
  }
}
