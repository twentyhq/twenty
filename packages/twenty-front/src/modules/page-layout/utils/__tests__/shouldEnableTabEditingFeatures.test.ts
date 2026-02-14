import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { PageLayoutType } from '~/generated-metadata/graphql';

describe('shouldEnableTabEditingFeatures', () => {
  it('should return true for DASHBOARD layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.DASHBOARD);
    expect(result).toBe(true);
  });

  it('should return false for RECORD_PAGE layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.RECORD_PAGE);
    expect(result).toBe(false);
  });

  it('should return false for RECORD_INDEX layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.RECORD_INDEX);
    expect(result).toBe(false);
  });

  describe('behavior validation', () => {
    it('should enable tab editing features only for dashboards', () => {
      // Dashboards should allow adding tabs and opening settings on click
      expect(shouldEnableTabEditingFeatures(PageLayoutType.DASHBOARD)).toBe(
        true,
      );

      // Record pages should NOT allow adding tabs or opening settings on click
      expect(shouldEnableTabEditingFeatures(PageLayoutType.RECORD_PAGE)).toBe(
        false,
      );

      // Record index pages should NOT allow adding tabs or opening settings on click
      expect(shouldEnableTabEditingFeatures(PageLayoutType.RECORD_INDEX)).toBe(
        false,
      );
    });
  });
});
