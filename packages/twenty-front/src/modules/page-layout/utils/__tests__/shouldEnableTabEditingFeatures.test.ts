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

  it('should return true for RECORD_PAGE layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.RECORD_PAGE);
    expect(result).toBe(true);
  });

  it('should return false for RECORD_INDEX layout type', () => {
    const result = shouldEnableTabEditingFeatures(PageLayoutType.RECORD_INDEX);
    expect(result).toBe(false);
  });
});
