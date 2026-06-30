import { toText } from 'src/logic-functions/utils/to-text';
import { parseGeo } from 'src/logic-functions/utils/parse-geo';
import { type AddressParts } from 'src/types/address-parts';
import { type AddressValue } from 'src/types/address-value';
import { isDefined } from 'src/utils/is-defined';

export const buildAddress = (parts: AddressParts): AddressValue | undefined => {
  const street1 = toText(parts.street1);
  const street2 = toText(parts.street2);
  const city = toText(parts.city);
  const postcode = toText(parts.postcode);
  const state = toText(parts.state);
  const country = toText(parts.country);
  const { lat, lng } = parseGeo(parts.geo);

  const hasAnyValue =
    isDefined(street1) ||
    isDefined(street2) ||
    isDefined(city) ||
    isDefined(postcode) ||
    isDefined(state) ||
    isDefined(country) ||
    isDefined(lat) ||
    isDefined(lng);

  if (!hasAnyValue) {
    return undefined;
  }

  return {
    addressStreet1: street1 ?? '',
    addressStreet2: street2 ?? '',
    addressCity: city ?? '',
    addressPostcode: postcode ?? '',
    addressState: state ?? '',
    addressCountry: country ?? '',
    addressLat: lat,
    addressLng: lng,
  };
};
