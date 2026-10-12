import { isFrontComponentSelectableAsWidget } from '@/side-panel/pages/page-layout/utils/isFrontComponentSelectableAsWidget';

describe('isFrontComponentSelectableAsWidget', () => {
  it('should return true for a visible front component', () => {
    expect(
      isFrontComponentSelectableAsWidget({
        isHeadless: false,
        excludeFromWidgetSelection: false,
      }),
    ).toBe(true);
  });

  it('should return false for a headless front component', () => {
    expect(
      isFrontComponentSelectableAsWidget({
        isHeadless: true,
        excludeFromWidgetSelection: false,
      }),
    ).toBe(false);
  });

  it('should return false for a front component excluded from widget selection', () => {
    expect(
      isFrontComponentSelectableAsWidget({
        isHeadless: false,
        excludeFromWidgetSelection: true,
      }),
    ).toBe(false);
  });
});
