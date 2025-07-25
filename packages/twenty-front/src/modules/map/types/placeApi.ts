export type placeAutocompleteVariables = {
  address: string;
  token: string;
  options?: {
    country?: string;
    language?: string;
  };
};

export type placeAutocompleteResult = {
  text: string;
  placeId: string;
};
export type placeDetailseResult = {
  state?: string;
  postcode?: string;
  city?: string;
  country?: string;
};
