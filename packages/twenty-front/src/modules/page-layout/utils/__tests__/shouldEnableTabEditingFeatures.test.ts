import { shouldEnableTabEditingFeatures } from '@/page-layout/utils/shouldEnableTabEditingFeatures';
import { PageLayoutType } from '~/generated-metadata/graphql';

describe('shouldEnableTabEditingFeatures', () => {
  it('should return true for DASHBOARD layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.DASHBOARD);
    expect(result).toBe(true);
  });

  it('should return true for STANDALONE_PAGE layout type', () => {
    const result = shouldEnableTabEditingFeatures(
      PageLayoutType.STANDALONE_PAGE,
    );
    expect(result).toBe(true);
  });

  it('should return false for RECORD_PAGE layout type without flag', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.RECORD_PAGE);
    expect(result).toBe(false);
  });

  it('should return true for RECORD_PAGE layout type with flag enabled', () => {
    const result = shouldEnableTabEditingFeatures(
      PageLayoutType.RECORD_PAGE,
      true,
    );
    expect(result).toBe(true);
  });

  it('should return false for RECORD_PAGE layout type with flag disabled', () => {
    const result = shouldEnableTabEditingFeatures(
      PageLayoutType.RECORD_PAGE,
      false,
    );
    expect(result).toBe(false);
  });

  it('should return false for RECORD_INDEX layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.RECORD_INDEX);
    expect(result).toBe(false);
  });

  it('should return false for RECORD_INDEX layout type even with flag', () => {
    const result = shouldEnableTabEditingFeatures(
      PageLayoutType.RECORD_INDEX,
      true,
    );
    expect(result).toBe(false);
  });

  describe('behavior validation', () => {
    it('should enable tab editing features only for dashboards, standalone pages, and record pages with flag', () => {
      expect(shouldEnableTabEditingFeatures(PageLayoutType.DASHBOARD)).toBe(
        true,
      );

      expect(
        shouldEnableTabEditingFeatures(PageLayoutType.STANDALONE_PAGE),
      ).toBe(true);

      expect(shouldEnableTabEditingFeatures(PageLayoutType.RECORD_PAGE)).toBe(
        false,
      );

      expect(
        shouldEnableTabEditingFeatures(PageLayoutType.RECORD_PAGE, true),
      ).toBe(true);

      expect(shouldEnableTabEditingFeatures(PageLayoutType.RECORD_INDEX)).toBe(
        false,
      );
    });
  });
});
