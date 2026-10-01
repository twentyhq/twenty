export type AddressAutocompleteBanFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties: {
    id: string;
    label: string;
    type: string;
    name?: string;
    postcode?: string;
    citycode?: string;
    city?: string;
    context?: string;
  };
};
