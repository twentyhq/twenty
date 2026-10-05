import { sanitizeAddressAutocompleteGooglePlacesSuggestions } from 'src/engine/core-modules/geo-map/drivers/google-places/utils/sanitize-address-autocomplete-google-places-suggestions.util';

// Real Google Places Autocomplete API prediction format
const GOOGLE_PREDICTIONS = [
  {
    description: '48 Pirrama Road, Pyrmont NSW 2009, Australia',
    place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  },
  {
    description: '111 8th Avenue, New York, NY 10011, USA',
    place_id: 'ChIJaXQRs6lZwokRY6EFpJnhNNE',
  },
  {
    description: 'Eiffel Tower, Avenue Anatole France, Paris, France',
    place_id: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
  },
];

describe('sanitizeAddressAutocompleteGooglePlacesSuggestions', () => {
  it('should return empty array for empty input', () => {
    expect(sanitizeAddressAutocompleteGooglePlacesSuggestions([])).toEqual([]);
  });

  it('should map predictions to text and placeId', () => {
    const result =
      sanitizeAddressAutocompleteGooglePlacesSuggestions(GOOGLE_PREDICTIONS);

    expect(result).toEqual([
      {
        text: '48 Pirrama Road, Pyrmont NSW 2009, Australia',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      },
      {
        text: '111 8th Avenue, New York, NY 10011, USA',
        placeId: 'ChIJaXQRs6lZwokRY6EFpJnhNNE',
      },
      {
        text: 'Eiffel Tower, Avenue Anatole France, Paris, France',
        placeId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
      },
    ]);
  });

  it('should map a single prediction', () => {
    const result = sanitizeAddressAutocompleteGooglePlacesSuggestions([
      GOOGLE_PREDICTIONS[0],
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('48 Pirrama Road, Pyrmont NSW 2009, Australia');
    expect(result[0].placeId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4');
  });
});
