export type GeoMapBanFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties: {
    id: string;
    label: string;
    type: string;
    name?: string;
    postcode?: string;
    city?: string;
    context?: string;
  };
};
