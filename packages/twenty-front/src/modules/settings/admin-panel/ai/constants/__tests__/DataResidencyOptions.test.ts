import { getDataResidencyOptions } from '@/settings/admin-panel/ai/constants/DataResidencyOptions';

describe('getDataResidencyOptions', () => {
  it('resolves labels using the current translator', () => {
    const english = getDataResidencyOptions(() => 'United States');
    const french = getDataResidencyOptions(() => 'États-Unis');

    expect(english.find(({ value }) => value === 'us')?.label).toBe(
      '🇺🇸 United States',
    );
    expect(french.find(({ value }) => value === 'us')?.label).toBe(
      '🇺🇸 États-Unis',
    );
  });
});
