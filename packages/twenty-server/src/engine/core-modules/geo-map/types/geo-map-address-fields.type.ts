import { type GeoMapLocationFields } from 'src/engine/core-modules/geo-map/types/geo-map-location-fields.type';

export type GeoMapAddressFields = {
  street?: string;
  state?: string;
  postcode?: string;
  city?: string;
  country?: string;
  location?: GeoMapLocationFields;
};
