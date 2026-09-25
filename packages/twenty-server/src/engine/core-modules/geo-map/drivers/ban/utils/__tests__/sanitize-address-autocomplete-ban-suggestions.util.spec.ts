import { parseAddressAutocompleteBanPlaceReference } from 'src/engine/core-modules/geo-map/drivers/ban/utils/parse-address-autocomplete-ban-place-reference.util';
import { sanitizeAddressAutocompleteBanSuggestions } from 'src/engine/core-modules/geo-map/drivers/ban/utils/sanitize-address-autocomplete-ban-suggestions.util';

const BAN_FEATURES = [
  {
    geometry: { coordinates: [2.290084, 49.897442] as [number, number] },
    properties: {
      id: '80021_6590_00008',
      citycode: '80021',
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
      citycode: '80021',
      label: 'Amiens',
      type: 'municipality',
      name: 'Amiens',
      postcode: '80000',
      city: 'Amiens',
      context: '80, Somme, Hauts-de-France',
    },
  },
];

describe('sanitizeAddressAutocompleteBanSuggestions', () => {
  it('should return empty array for empty input', () => {
    expect(sanitizeAddressAutocompleteBanSuggestions([])).toEqual([]);
  });

  it('shows the label, prefixed with the postcode for municipalities', () => {
    expect(
      sanitizeAddressAutocompleteBanSuggestions(BAN_FEATURES).map(
        ({ text }) => text,
      ),
    ).toEqual(['8 Boulevard du Port 80000 Amiens', '80000 Amiens']);
  });

  it('encodes a place reference that parses back to the same feature', () => {
    const [street, municipality] =
      sanitizeAddressAutocompleteBanSuggestions(BAN_FEATURES);

    expect(parseAddressAutocompleteBanPlaceReference(street.placeId)).toEqual({
      label: '8 Boulevard du Port 80000 Amiens',
      citycode: '80021',
      type: 'housenumber',
    });
    expect(
      parseAddressAutocompleteBanPlaceReference(municipality.placeId),
    ).toEqual({ label: 'Amiens', citycode: '80021', type: 'municipality' });
  });
});
