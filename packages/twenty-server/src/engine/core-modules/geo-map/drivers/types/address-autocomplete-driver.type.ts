import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';

export type AddressAutocompleteSuggestionsInput = {
  query: string;
  sessionToken?: string;
  country?: string;
  isCityOnly?: boolean;
};

export type AddressAutocompleteDetailsInput = {
  placeId: string;
  sessionToken?: string;
};

export type AddressAutocompleteDriver = {
  getSuggestions(
    input: AddressAutocompleteSuggestionsInput,
  ): Promise<GeoMapAutocompleteSanitizedResult[]>;
  getAddressDetails(
    input: AddressAutocompleteDetailsInput,
  ): Promise<GeoMapAddressFields>;
};
