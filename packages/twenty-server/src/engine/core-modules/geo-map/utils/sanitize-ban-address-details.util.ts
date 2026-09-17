import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type GeoMapAddressFields } from 'src/engine/core-modules/geo-map/types/geo-map-address-fields.type';
import { type GeoMapBanFeature } from 'src/engine/core-modules/geo-map/types/geo-map-ban-feature.type';

const BAN_COUNTRY_CODE = 'FR';

// BAN context reads "<department code>, <department>, <region>"; the region is the closest match to Google's administrative_area_level_1.
const getRegionFromContext = (context?: string): string | undefined => {
  const contextParts = context?.split(',');
  const region = contextParts?.[contextParts.length - 1]?.trim();

  return isNonEmptyString(region) ? region : undefined;
};

export const sanitizeBanAddressDetails = (
  feature: GeoMapBanFeature | undefined,
): GeoMapAddressFields => {
  if (!isDefined(feature)) return {};

  const { properties, geometry } = feature;
  const [lng, lat] = geometry?.coordinates ?? [];

  return {
    street: properties.type === 'municipality' ? undefined : properties.name,
    city: properties.city,
    postcode: properties.postcode,
    state: getRegionFromContext(properties.context),
    country: BAN_COUNTRY_CODE,
    location: isDefined(lat) && isDefined(lng) ? { lat, lng } : undefined,
  };
};
