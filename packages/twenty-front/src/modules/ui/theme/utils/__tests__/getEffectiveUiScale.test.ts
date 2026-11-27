import { getEffectiveUiScale } from '@/ui/theme/utils/getEffectiveUiScale';

describe('getEffectiveUiScale', () => {
  it('follows the workspace scale when the member kept the default', () => {
    expect(getEffectiveUiScale('Default', 'Large')).toBe('Large');
  });

  it('keeps the member choice over the workspace scale', () => {
    expect(getEffectiveUiScale('Normal', 'Larger')).toBe('Normal');
    expect(getEffectiveUiScale('Smaller', 'Large')).toBe('Smaller');
  });

  it('falls back to the member value when the workspace scale is unknown', () => {
    expect(getEffectiveUiScale('Default', undefined)).toBe('Default');
    expect(getEffectiveUiScale('Default', 'Huge')).toBe('Default');
  });
});
