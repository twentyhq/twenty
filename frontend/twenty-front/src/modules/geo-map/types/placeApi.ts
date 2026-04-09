export type PlaceAutocompleteVariables = {
  address: string;
  token: string;
  options?: {
    country?: string;
    language?: string;
  };
};

export type PlaceAutocompleteResult = {
  text: string;
  placeId: string;
};

export type PlaceDetailsResult = {
  state?: string;
  postcode?: string;
  city?: string;
  country?: string;
  location?: {
    lat?: number;
    lng?: number;
  };
};
