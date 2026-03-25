export type AutocompleteSanitizedResult = {
  text: string;
  placeId: string;
};

type GooglePrediction = {
  description: string;
  place_id: string;
};
export const sanitizeAutocompleteResults = (
  autocompleteResults: GooglePrediction[],
): AutocompleteSanitizedResult[] => {
  if (!Array.isArray(autocompleteResults) || autocompleteResults.length === 0)
    return [];

  return autocompleteResults.map((result) => ({
    text: result.description,
    placeId: result.place_id,
  }));
};
