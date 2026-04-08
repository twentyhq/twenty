import { sanitizePlaceDetailsResults } from './sanitize-place-details-results.util';

describe('sanitizePlaceDetailsResults', () => {
  it('should extract street details from address components', () => {
    const result = sanitizePlaceDetailsResults(
      [
        {
          long_name: '123',
          short_name: '123',
          types: ['street_number'],
        },
        {
          long_name: 'Main St',
          short_name: 'Main St',
          types: ['route'],
        },
        {
          long_name: 'Springfield',
          short_name: 'Springfield',
          types: ['locality'],
        },
        {
          long_name: 'Illinois',
          short_name: 'IL',
          types: ['administrative_area_level_1'],
        },
        {
          long_name: '62704',
          short_name: '62704',
          types: ['postal_code'],
        },
        {
          long_name: 'United States',
          short_name: 'US',
          types: ['country'],
        },
      ],
      { lat: 39.7817, lng: -89.6501 },
    );

    expect(result).toEqual({
      street: '123 Main St',
      city: 'Springfield',
      state: 'Illinois',
      postcode: '62704',
      country: 'US',
      location: { lat: 39.7817, lng: -89.6501 },
    });
  });

  it('should handle a route without a street number', () => {
    const result = sanitizePlaceDetailsResults([
      {
        long_name: 'Broadway',
        short_name: 'Broadway',
        types: ['route'],
      },
      {
        long_name: 'New York',
        short_name: 'New York',
        types: ['locality'],
      },
    ]);

    expect(result.street).toBe('Broadway');
    expect(result.city).toBe('New York');
  });
});
