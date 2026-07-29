import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';

describe('normalizeIconName', () => {
  it('should return a canonical icon name unchanged', () => {
    expect(normalizeIconName('IconBuildingSkyscraper')).toBe(
      'IconBuildingSkyscraper',
    );
    expect(normalizeIconName('Icon123')).toBe('Icon123');
  });

  it('should fix a lowercased or separated Icon prefix', () => {
    expect(normalizeIconName('iconPaw')).toBe('IconPaw');
    expect(normalizeIconName('icon user')).toBe('IconUser');
  });

  it('should normalize raw tabler slugs without the Icon prefix', () => {
    expect(normalizeIconName('building-skyscraper')).toBe(
      'IconBuildingSkyscraper',
    );
    expect(normalizeIconName('paw')).toBe('IconPaw');
    expect(normalizeIconName('currency_dollar')).toBe('IconCurrencyDollar');
  });

  it('should normalize uppercase slugs without breaking camelCase words', () => {
    expect(normalizeIconName('BUILDING_SKYSCRAPER')).toBe(
      'IconBuildingSkyscraper',
    );
    expect(normalizeIconName('ICONUSER')).toBe('IconUser');
    expect(normalizeIconName('buildingSkyscraper')).toBe(
      'IconBuildingSkyscraper',
    );
  });

  it('should normalize unknown names to a renderable shape for the frontend fallback', () => {
    expect(normalizeIconName('IconDoesNotExist')).toBe('IconDoesNotExist');
    expect(normalizeIconName('not a real icon')).toBe('IconNotARealIcon');
  });

  it('should return undefined for missing or unusable input', () => {
    expect(normalizeIconName(undefined)).toBeUndefined();
    expect(normalizeIconName('')).toBeUndefined();
    expect(normalizeIconName('   ')).toBeUndefined();
    expect(normalizeIconName('!!!')).toBeUndefined();
    expect(normalizeIconName('icon')).toBeUndefined();
  });
});
