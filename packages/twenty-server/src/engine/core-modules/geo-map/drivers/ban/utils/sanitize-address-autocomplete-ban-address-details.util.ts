import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { ADDRESS_AUTOCOMPLETE_BAN_COUNTRY_CODE } from 'src/engine/core-modules/geo-map/drivers/ban/constants/address-autocomplete-ban-country-code.constant';
import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type AddressAutocompleteBanFeature } from 'src/engine/core-modules/geo-map/drivers/ban/types/address-autocomplete-ban-feature.type';

const getRegionFromContext = (context?: string): string | undefined => {
  const contextParts = context?.split(',');
  const region = contextParts?.[contextParts.length - 1]?.trim();

  return isNonEmptyString(region) ? region : undefined;
};

export const sanitizeAddressAutocompleteBanAddressDetails = (
  feature: AddressAutocompleteBanFeature | undefined,
): GeoMapAddressFields => {
  if (!isDefined(feature)) {
    return {};
  }

  const { properties, geometry } = feature;
  const [lng, lat] = geometry?.coordinates ?? [];

  return {
    street: properties.type === 'municipality' ? undefined : properties.name,
    city: properties.city,
    postcode: properties.postcode,
    state: getRegionFromContext(properties.context),
    country: ADDRESS_AUTOCOMPLETE_BAN_COUNTRY_CODE,
    location: isDefined(lat) && isDefined(lng) ? { lat, lng } : undefined,
  };
};
