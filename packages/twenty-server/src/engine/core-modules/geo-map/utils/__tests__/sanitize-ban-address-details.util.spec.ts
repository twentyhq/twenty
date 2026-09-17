import { sanitizeBanAddressDetails } from 'src/engine/core-modules/geo-map/utils/sanitize-ban-address-details.util';

// Real Base Adresse Nationale /search feature format
const HOUSENUMBER_FEATURE = {
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
};

const MUNICIPALITY_FEATURE = {
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
};

describe('sanitizeBanAddressDetails', () => {
  it('should return empty object when no feature is given', () => {
    expect(sanitizeBanAddressDetails(undefined)).toEqual({});
  });

  it('should map a housenumber feature to address fields', () => {
    expect(sanitizeBanAddressDetails(HOUSENUMBER_FEATURE)).toEqual({
      street: '8 Boulevard du Port',
      city: 'Amiens',
      postcode: '80000',
      state: 'Hauts-de-France',
      country: 'FR',
      location: { lat: 49.897442, lng: 2.290084 },
    });
  });

  it('should leave street empty for a municipality feature', () => {
    const result = sanitizeBanAddressDetails(MUNICIPALITY_FEATURE);

    expect(result.street).toBeUndefined();
    expect(result.city).toBe('Amiens');
    expect(result.postcode).toBe('80000');
    expect(result.state).toBe('Hauts-de-France');
  });

  it('should omit location and state when the feature lacks them', () => {
    const result = sanitizeBanAddressDetails({
      properties: {
        id: '80021_6590_00008',
        label: '8 Boulevard du Port 80000 Amiens',
        type: 'housenumber',
        name: '8 Boulevard du Port',
      },
    });

    expect(result.location).toBeUndefined();
    expect(result.state).toBeUndefined();
    expect(result.country).toBe('FR');
  });
});
