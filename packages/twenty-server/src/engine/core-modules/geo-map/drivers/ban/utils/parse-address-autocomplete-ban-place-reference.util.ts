import { isNonEmptyString } from '@sniptt/guards';

import { ADDRESS_AUTOCOMPLETE_BAN_FEATURE_TYPES } from 'src/engine/core-modules/geo-map/drivers/ban/constants/address-autocomplete-ban-feature-types.constant';
import { type AddressAutocompleteBanPlaceReference } from 'src/engine/core-modules/geo-map/drivers/ban/types/address-autocomplete-ban-place-reference.type';

const CITYCODE_REGEX = /^[0-9][0-9AB][0-9]{3}$/;

export const parseAddressAutocompleteBanPlaceReference = (
  placeId: string,
): AddressAutocompleteBanPlaceReference | null => {
  const searchParams = new URLSearchParams(placeId);
  const label = searchParams.get('label');

  if (!isNonEmptyString(label)) {
    return null;
  }

  const citycode = searchParams.get('citycode');
  const type = searchParams.get('type');

  return {
    label,
    ...(isNonEmptyString(citycode) &&
      CITYCODE_REGEX.test(citycode) && { citycode }),
    ...(isNonEmptyString(type) &&
      ADDRESS_AUTOCOMPLETE_BAN_FEATURE_TYPES.includes(type) && { type }),
  };
};
