import { isNonEmptyArray } from 'twenty-shared/utils';

import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';
import { type GeoMapGooglePrediction } from 'src/engine/core-modules/geo-map/types/geo-map-google-prediction.type';

export const sanitizeAutocompleteResults = (
  autocompleteResults: GeoMapGooglePrediction[],
): GeoMapAutocompleteSanitizedResult[] => {
  if (!isNonEmptyArray(autocompleteResults)) return [];

  return autocompleteResults.map((result) => ({
    text: result.description,
    placeId: result.place_id,
  }));
};
