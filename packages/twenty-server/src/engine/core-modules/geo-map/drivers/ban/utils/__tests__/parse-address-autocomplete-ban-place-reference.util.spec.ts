import { parseAddressAutocompleteBanPlaceReference } from 'src/engine/core-modules/geo-map/drivers/ban/utils/parse-address-autocomplete-ban-place-reference.util';

describe('parseAddressAutocompleteBanPlaceReference', () => {
  it('reads the label, city code and type', () => {
    expect(
      parseAddressAutocompleteBanPlaceReference(
        'label=Saint-Denis&citycode=93066&type=municipality',
      ),
    ).toEqual({
      label: 'Saint-Denis',
      citycode: '93066',
      type: 'municipality',
    });
  });

  it('accepts Corsican city codes', () => {
    expect(
      parseAddressAutocompleteBanPlaceReference('label=Ajaccio&citycode=2A004')
        ?.citycode,
    ).toBe('2A004');
  });

  it('drops a city code or type it does not recognise', () => {
    expect(
      parseAddressAutocompleteBanPlaceReference(
        'label=Paris&citycode=75056%26limit%3D100&type=anything',
      ),
    ).toEqual({ label: 'Paris' });
  });

  it('returns null without a label', () => {
    expect(
      parseAddressAutocompleteBanPlaceReference('citycode=93066'),
    ).toBeNull();
    expect(parseAddressAutocompleteBanPlaceReference('')).toBeNull();
  });
});
