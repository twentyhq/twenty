import { isNull, isUndefined } from '@sniptt/guards';

import { transformNumericField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-numeric-field.util';
import { transformTextField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-text-field.util';

export const transformAddressField = (
  value: {
    addressStreet1?: string | null;
    addressStreet2?: string | null;
    addressCity?: string | null;
    addressState?: string | null;
    addressPostcode?: string | null;
    addressCountry?: string | null;
    addressLat?: number | null;
    addressLng?: number | null;
  } | null,
): {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
  addressLat?: number | null;
  addressLng?: number | null;
} | null => {
  if (isNull(value)) return null;

  return {
    addressStreet1: isUndefined(value.addressStreet1)
      ? undefined
      : transformTextField(value.addressStreet1),
    addressStreet2: isUndefined(value.addressStreet2)
      ? undefined
      : transformTextField(value.addressStreet2),
    addressCity: isUndefined(value.addressCity)
      ? undefined
      : transformTextField(value.addressCity),
    addressState: isUndefined(value.addressState)
      ? undefined
      : transformTextField(value.addressState),
    addressPostcode: isUndefined(value.addressPostcode)
      ? undefined
      : transformTextField(value.addressPostcode),
    addressCountry: isUndefined(value.addressCountry)
      ? undefined
      : transformTextField(value.addressCountry),
    addressLat: isUndefined(value.addressLat)
      ? undefined
      : transformNumericField(value.addressLat),
    addressLng: isUndefined(value.addressLng)
      ? undefined
      : transformNumericField(value.addressLng),
  };
};
