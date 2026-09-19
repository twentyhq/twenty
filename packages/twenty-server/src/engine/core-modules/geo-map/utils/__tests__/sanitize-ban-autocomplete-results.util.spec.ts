import { sanitizeBanAutocompleteResults } from 'src/engine/core-modules/geo-map/utils/sanitize-ban-autocomplete-results.util';

// Real Base Adresse Nationale /search feature format
const BAN_FEATURES = [
  {
    geometry: { coordinates: [2.290084, 49.897442] as [number, number] },
    properties: {
      id: '80021_6590_00008',
      label: '8 Boulevard du Port 80000 Amiens',
      type: 'housenumber',
      name: '8 Boulevard du Port',
      postcode: '80000',
      city: 'Amiens',
      context: '80, Somme, Hauts-de-France',
    },
  },
  {
    geometry: { coordinates: [2.292605, 49.903041] as [number, number] },
    properties: {
      id: '80021',
      label: 'Amiens',
      type: 'municipality',
      name: 'Amiens',
      postcode: '80000',
      city: 'Amiens',
      context: '80, Somme, Hauts-de-France',
    },
  },
];

describe('sanitizeBanAutocompleteResults', () => {
  it('should return empty array for empty input', () => {
    expect(sanitizeBanAutocompleteResults([])).toEqual([]);
  });

  it('should use the label as both text and placeId', () => {
    expect(sanitizeBanAutocompleteResults(BAN_FEATURES)).toEqual([
      {
        text: '8 Boulevard du Port 80000 Amiens',
        placeId: '8 Boulevard du Port 80000 Amiens',
      },
      {
        text: 'Amiens',
        placeId: 'Amiens',
      },
    ]);
  });
});
