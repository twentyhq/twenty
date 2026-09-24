import { type ADDRESS_AUTOCOMPLETE_DRIVER_TYPE } from 'src/engine/core-modules/geo-map/constants/address-autocomplete-driver-type.constant';

export type AddressAutocompleteDriverType =
  (typeof ADDRESS_AUTOCOMPLETE_DRIVER_TYPE)[keyof typeof ADDRESS_AUTOCOMPLETE_DRIVER_TYPE];
