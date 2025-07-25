export type AutocompleteSanitizedResult = {
  text: string;
  placeId: string;
};
export const sanitizeAutocompleteResults = (
  autocompleteResults: any,
): AutocompleteSanitizedResult[] => {
  if (!Array.isArray(autocompleteResults) || autocompleteResults.length === 0)
    return [];
  return autocompleteResults.map((result: any) => ({
    text: result.description,
    placeId: result.place_id,
  }));
};
