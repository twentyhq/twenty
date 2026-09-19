import { isNonEmptyArray } from 'twenty-shared/utils';

import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';
import { type GeoMapBanFeature } from 'src/engine/core-modules/geo-map/types/geo-map-ban-feature.type';

// The BAN has no lookup-by-id endpoint, so the label doubles as the key used to fetch details later.
export const sanitizeBanAutocompleteResults = (
  features: GeoMapBanFeature[],
): GeoMapAutocompleteSanitizedResult[] => {
  if (!isNonEmptyArray(features)) return [];

  return features.map((feature) => ({
    text: feature.properties.label,
    placeId: feature.properties.label,
  }));
};
