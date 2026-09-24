import { buildAddressAutocompleteBanSearchParams } from 'src/engine/core-modules/geo-map/drivers/ban/utils/build-address-autocomplete-ban-search-params.util';

describe('buildAddressAutocompleteBanSearchParams', () => {
  it('builds a trimmed, limited query', () => {
    expect(
      buildAddressAutocompleteBanSearchParams({
        query: '  8 bd du port ',
      })?.toString(),
    ).toBe('q=8+bd+du+port&limit=5');
  });

  it('restricts results to municipalities for city fields', () => {
    expect(
      buildAddressAutocompleteBanSearchParams({
        query: 'Lyo',
        isCityOnly: true,
      })?.get('type'),
    ).toBe('municipality');
  });

  it.each(['', 'ab', '  ab  ', '-rue de Rivoli', '"Paris'])(
    'skips queries the API would reject: %p',
    (query) => {
      expect(buildAddressAutocompleteBanSearchParams({ query })).toBeNull();
    },
  );

  it('accepts accented first letters', () => {
    expect(
      buildAddressAutocompleteBanSearchParams({ query: 'Évry' })?.get('q'),
    ).toBe('Évry');
  });

  it('caps the query at 200 characters', () => {
    expect(
      buildAddressAutocompleteBanSearchParams({ query: 'a'.repeat(250) })?.get(
        'q',
      ),
    ).toHaveLength(200);
  });

  it('narrows the search to one city and result type', () => {
    const searchParams = buildAddressAutocompleteBanSearchParams({
      query: 'Saint-Denis',
      citycode: '93066',
      type: 'municipality',
    });

    expect(searchParams?.get('citycode')).toBe('93066');
    expect(searchParams?.get('type')).toBe('municipality');
  });
});
