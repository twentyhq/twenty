import { getCountryFilterDisplayValue } from '@/object-record/object-filter-dropdown/utils/getCountryFilterDisplayValue';

describe('getCountryFilterDisplayValue', () => {
  it('should join up to five country names', () => {
    expect(getCountryFilterDisplayValue(['France', 'Germany'])).toBe(
      'France, Germany',
    );
  });

  it('should count the countries when there are more than five', () => {
    expect(
      getCountryFilterDisplayValue([
        'France',
        'Germany',
        'Italy',
        'Spain',
        'Portugal',
        'Belgium',
      ]),
    ).toBe('6 countries');
  });
});
