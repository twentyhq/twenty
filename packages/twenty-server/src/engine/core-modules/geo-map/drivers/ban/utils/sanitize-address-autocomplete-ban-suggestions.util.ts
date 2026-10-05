import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type AddressAutocompleteBanFeature } from 'src/engine/core-modules/geo-map/drivers/ban/types/address-autocomplete-ban-feature.type';
import { serializeAddressAutocompleteBanPlaceReference } from 'src/engine/core-modules/geo-map/drivers/ban/utils/serialize-address-autocomplete-ban-place-reference.util';
import { type GeoMapAutocompleteSanitizedResult } from 'src/engine/core-modules/geo-map/types/geo-map-autocomplete-sanitized-result.type';

const getSuggestionText = ({
  properties,
}: AddressAutocompleteBanFeature): string => {
  const isMunicipalityWithPostcode =
    properties.type === 'municipality' && isNonEmptyString(properties.postcode);

  if (isMunicipalityWithPostcode) {
    return `${properties.postcode} ${properties.label}`;
  }

  return properties.label;
};

export const sanitizeAddressAutocompleteBanSuggestions = (
  features: AddressAutocompleteBanFeature[],
): GeoMapAutocompleteSanitizedResult[] => {
  if (!isNonEmptyArray(features)) {
    return [];
  }

  return features.map((feature) => ({
    text: getSuggestionText(feature),
    placeId: serializeAddressAutocompleteBanPlaceReference(feature),
  }));
};
