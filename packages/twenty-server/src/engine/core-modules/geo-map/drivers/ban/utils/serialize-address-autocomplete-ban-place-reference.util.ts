import { isNonEmptyString } from '@sniptt/guards';

import { type AddressAutocompleteBanFeature } from 'src/engine/core-modules/geo-map/drivers/ban/types/address-autocomplete-ban-feature.type';

export const serializeAddressAutocompleteBanPlaceReference = ({
  properties,
}: AddressAutocompleteBanFeature): string => {
  const searchParams = new URLSearchParams({ label: properties.label });

  if (isNonEmptyString(properties.citycode)) {
    searchParams.set('citycode', properties.citycode);
  }

  if (isNonEmptyString(properties.type)) {
    searchParams.set('type', properties.type);
  }

  return searchParams.toString();
};
