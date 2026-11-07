import { formatSessionLocation } from '@/settings/profile/devices/utils/formatSessionLocation';

describe('formatSessionLocation', () => {
  it('should show the city and the country name', () => {
    expect(
      formatSessionLocation({
        city: 'Paris',
        region: 'Île-de-France',
        country: 'FR',
        locale: 'en',
      }),
    ).toBe('Paris, France');
  });

  it('should name the country in the given locale', () => {
    expect(
      formatSessionLocation({ city: 'Berlin', country: 'DE', locale: 'fr-FR' }),
    ).toBe('Berlin, Allemagne');
  });

  it('should fall back to the region without a city', () => {
    expect(
      formatSessionLocation({
        city: null,
        region: 'California',
        country: 'US',
        locale: 'en',
      }),
    ).toBe('California, United States');
  });

  it('should return nothing without any location', () => {
    expect(
      formatSessionLocation({
        city: null,
        region: null,
        country: null,
        locale: 'en',
      }),
    ).toBeUndefined();
  });
});
