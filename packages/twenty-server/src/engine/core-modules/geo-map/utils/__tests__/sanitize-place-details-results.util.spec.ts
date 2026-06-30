import { type GeoMapAddressComponent } from 'src/engine/core-modules/geo-map/types/geo-map-address-component.type';
import { sanitizePlaceDetailsResults } from 'src/engine/core-modules/geo-map/utils/sanitize-place-details-results.util';

// Real Google Places API response for "48 Pirrama Road, Pyrmont NSW 2009, Australia"
const GOOGLE_OFFICE_SYDNEY: GeoMapAddressComponent[] = [
  { long_name: '48', short_name: '48', types: ['street_number'] },
  {
    long_name: 'Pirrama Road',
    short_name: 'Pirrama Rd',
    types: ['route'],
  },
  {
    long_name: 'Pyrmont',
    short_name: 'Pyrmont',
    types: ['locality', 'political'],
  },
  {
    long_name: 'City of Sydney',
    short_name: 'City of Sydney',
    types: ['administrative_area_level_2', 'political'],
  },
  {
    long_name: 'New South Wales',
    short_name: 'NSW',
    types: ['administrative_area_level_1', 'political'],
  },
  {
    long_name: 'Australia',
    short_name: 'AU',
    types: ['country', 'political'],
  },
  { long_name: '2009', short_name: '2009', types: ['postal_code'] },
];

// Real Google Places API response for "111 8th Avenue, New York, NY 10011, USA"
const NYC_ADDRESS: GeoMapAddressComponent[] = [
  { long_name: '111', short_name: '111', types: ['street_number'] },
  {
    long_name: '8th Avenue',
    short_name: '8th Ave',
    types: ['route'],
  },
  {
    long_name: 'New York',
    short_name: 'New York',
    types: ['locality', 'political'],
  },
  {
    long_name: 'New York County',
    short_name: 'New York County',
    types: ['administrative_area_level_2', 'political'],
  },
  {
    long_name: 'New York',
    short_name: 'NY',
    types: ['administrative_area_level_1', 'political'],
  },
  {
    long_name: 'United States',
    short_name: 'US',
    types: ['country', 'political'],
  },
  { long_name: '10011', short_name: '10011', types: ['postal_code'] },
  {
    long_name: '1305',
    short_name: '1305',
    types: ['postal_code_suffix'],
  },
];

// UK address using postal_town (London addresses often lack locality)
const UK_ADDRESS: GeoMapAddressComponent[] = [
  { long_name: '221B', short_name: '221B', types: ['street_number'] },
  {
    long_name: 'Baker Street',
    short_name: 'Baker St',
    types: ['route'],
  },
  {
    long_name: 'London',
    short_name: 'London',
    types: ['postal_town'],
  },
  {
    long_name: 'Greater London',
    short_name: 'Greater London',
    types: ['administrative_area_level_2', 'political'],
  },
  {
    long_name: 'England',
    short_name: 'England',
    types: ['administrative_area_level_1', 'political'],
  },
  {
    long_name: 'United Kingdom',
    short_name: 'GB',
    types: ['country', 'political'],
  },
  { long_name: 'NW1 6XE', short_name: 'NW1 6XE', types: ['postal_code'] },
];

// Landmark without street_number or route
const LANDMARK: GeoMapAddressComponent[] = [
  {
    long_name: 'Paris',
    short_name: 'Paris',
    types: ['locality', 'political'],
  },
  {
    long_name: 'Paris',
    short_name: 'Paris',
    types: ['administrative_area_level_2', 'political'],
  },
  {
    long_name: 'Île-de-France',
    short_name: 'IDF',
    types: ['administrative_area_level_1', 'political'],
  },
  {
    long_name: 'France',
    short_name: 'FR',
    types: ['country', 'political'],
  },
  { long_name: '75007', short_name: '75007', types: ['postal_code'] },
];

describe('sanitizePlaceDetailsResults', () => {
  it('should return empty object for empty array', () => {
    expect(sanitizePlaceDetailsResults({ addressComponents: [] })).toEqual({});
  });

  it('should parse a full US address (Google Sydney office)', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: GOOGLE_OFFICE_SYDNEY,
      location: { lat: -33.866489, lng: 151.1958561 },
    });

    expect(result).toEqual({
      street: '48 Pirrama Road',
      city: 'Pyrmont',
      state: 'New South Wales',
      country: 'AU',
      postcode: '2009',
      location: { lat: -33.866489, lng: 151.1958561 },
    });
  });

  it('should parse US address with postal_code_suffix', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: NYC_ADDRESS,
    });

    expect(result).toEqual({
      street: '111 8th Avenue',
      city: 'New York',
      state: 'New York',
      country: 'US',
      postcode: '10011-1305',
      location: undefined,
    });
  });

  it('should use postal_town as city fallback (UK address)', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: UK_ADDRESS,
    });

    expect(result).toEqual({
      street: '221B Baker Street',
      city: 'London',
      state: 'England',
      country: 'GB',
      postcode: 'NW1 6XE',
      location: undefined,
    });
  });

  it('should not set street when no street_number or route', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: LANDMARK,
    });

    expect(result.street).toBeUndefined();
    expect(result.city).toBe('Paris');
    expect(result.country).toBe('FR');
  });

  it('should set street with only route (no street_number)', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: [
        {
          long_name: 'Broadway',
          short_name: 'Broadway',
          types: ['route'],
        },
      ],
    });

    expect(result.street).toBe('Broadway');
  });

  it('should use administrative_area_level_2 as state fallback', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: [
        {
          long_name: 'Some County',
          short_name: 'Some County',
          types: ['administrative_area_level_2', 'political'],
        },
      ],
    });

    expect(result.state).toBe('Some County');
  });

  it('should prefer administrative_area_level_1 over level_2 for state', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: [
        {
          long_name: 'Some County',
          short_name: 'Some County',
          types: ['administrative_area_level_2', 'political'],
        },
        {
          long_name: 'California',
          short_name: 'CA',
          types: ['administrative_area_level_1', 'political'],
        },
      ],
    });

    expect(result.state).toBe('California');
  });

  it('should prefer locality over postal_town for city', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: [
        {
          long_name: 'Westminster',
          short_name: 'Westminster',
          types: ['locality', 'political'],
        },
        {
          long_name: 'London',
          short_name: 'London',
          types: ['postal_town'],
        },
      ],
    });

    expect(result.city).toBe('Westminster');
  });

  it('should use administrative_area_level_3 as city fallback', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: [
        {
          long_name: 'Small Town',
          short_name: 'Small Town',
          types: ['administrative_area_level_3', 'political'],
        },
      ],
    });

    expect(result.city).toBe('Small Town');
  });

  it('should use short_name for country', () => {
    const result = sanitizePlaceDetailsResults({
      addressComponents: [
        {
          long_name: 'United States',
          short_name: 'US',
          types: ['country', 'political'],
        },
      ],
    });

    expect(result.country).toBe('US');
  });
});
