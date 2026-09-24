import { isNonEmptyArray } from 'twenty-shared/utils';

import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';
import { type AddressAutocompleteGooglePlacesPrediction } from 'src/engine/core-modules/geo-map/drivers/google-places/types/address-autocomplete-google-places-prediction.type';

export const sanitizeAddressAutocompleteGooglePlacesSuggestions = (
  autocompleteResults: AddressAutocompleteGooglePlacesPrediction[],
): GeoMapAutocompleteSanitizedResult[] => {
  if (!isNonEmptyArray(autocompleteResults)) return [];

  return autocompleteResults.map((result) => ({
    text: result.description,
    placeId: result.place_id,
  }));
};
