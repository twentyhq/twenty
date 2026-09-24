import { type AxiosInstance } from 'axios';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ADDRESS_AUTOCOMPLETE_BAN_COUNTRY_CODE } from 'src/engine/core-modules/geo-map/drivers/ban/constants/address-autocomplete-ban-country-code.constant';
import {
  type AddressAutocompleteDetailsInput,
  type AddressAutocompleteDriver,
  type AddressAutocompleteSuggestionsInput,
} from 'src/engine/core-modules/geo-map/drivers/types/address-autocomplete-driver.type';
import { type AddressAutocompleteBanFeature } from 'src/engine/core-modules/geo-map/drivers/ban/types/address-autocomplete-ban-feature.type';
import { parseAddressAutocompleteBanPlaceReference } from 'src/engine/core-modules/geo-map/drivers/ban/utils/parse-address-autocomplete-ban-place-reference.util';
import { buildAddressAutocompleteBanSearchParams } from 'src/engine/core-modules/geo-map/drivers/ban/utils/build-address-autocomplete-ban-search-params.util';
import { sanitizeAddressAutocompleteBanAddressDetails } from 'src/engine/core-modules/geo-map/drivers/ban/utils/sanitize-address-autocomplete-ban-address-details.util';
import { sanitizeAddressAutocompleteBanSuggestions } from 'src/engine/core-modules/geo-map/drivers/ban/utils/sanitize-address-autocomplete-ban-suggestions.util';
import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';

const ADDRESS_AUTOCOMPLETE_BAN_SEARCH_URL =
  'https://data.geopf.fr/geocodage/search';

export class AddressAutocompleteBanDriver implements AddressAutocompleteDriver {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getSuggestions({
    query,
    country,
    isCityOnly,
  }: AddressAutocompleteSuggestionsInput): Promise<
    GeoMapAutocompleteSanitizedResult[]
  > {
    if (
      isNonEmptyString(country) &&
      country !== ADDRESS_AUTOCOMPLETE_BAN_COUNTRY_CODE
    ) {
      return [];
    }

    return sanitizeAddressAutocompleteBanSuggestions(
      await this.search({ query, isCityOnly }),
    );
  }

  async getAddressDetails({
    placeId,
  }: AddressAutocompleteDetailsInput): Promise<GeoMapAddressFields> {
    const placeReference = parseAddressAutocompleteBanPlaceReference(placeId);

    if (!isDefined(placeReference)) {
      return {};
    }

    const features = await this.search({
      query: placeReference.label,
      citycode: placeReference.citycode,
      type: placeReference.type,
    });
    const exactMatch = features.find(
      ({ properties }) =>
        properties.label === placeReference.label &&
        (!isDefined(placeReference.citycode) ||
          properties.citycode === placeReference.citycode),
    );

    return sanitizeAddressAutocompleteBanAddressDetails(
      exactMatch ?? features[0],
    );
  }

  private async search(
    searchInput: Parameters<typeof buildAddressAutocompleteBanSearchParams>[0],
  ): Promise<AddressAutocompleteBanFeature[]> {
    const searchParams = buildAddressAutocompleteBanSearchParams(searchInput);

    if (!isDefined(searchParams)) {
      return [];
    }

    const result = await this.httpClient.get(
      `${ADDRESS_AUTOCOMPLETE_BAN_SEARCH_URL}?${searchParams.toString()}`,
    );

    return result.data?.features ?? [];
  }
}
