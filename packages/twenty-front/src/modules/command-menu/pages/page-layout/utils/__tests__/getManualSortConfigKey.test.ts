import { getManualSortConfigKey } from '@/command-menu/pages/page-layout/utils/getManualSortConfigKey';

describe('getManualSortConfigKey', () => {
  it('should return manualSortOrder for pie axis', () => {
    expect(getManualSortConfigKey('pie')).toBe('manualSortOrder');
  });

  it('should return primaryAxisManualSortOrder for primary axis', () => {
    expect(getManualSortConfigKey('primary')).toBe(
      'primaryAxisManualSortOrder',
    );
  });

  it('should return secondaryAxisManualSortOrder for secondary axis', () => {
    expect(getManualSortConfigKey('secondary')).toBe(
      'secondaryAxisManualSortOrder',
    );
  });
});
