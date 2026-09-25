import { getVisibilityLabel } from '@/side-panel/pages/page-layout/utils/getVisibilityLabel';

describe('getVisibilityLabel', () => {
  const labels = {
    anyDevice: 'Any device',
    mobile: 'Mobile',
    desktop: 'Desktop',
  };

  it('should label the device a widget is restricted to', () => {
    expect(getVisibilityLabel(undefined, labels)).toBe('Any device');
    expect(getVisibilityLabel('device == "MOBILE"', labels)).toBe('Mobile');
  });

  it('should ignore the feature flag condition a layout ships with', () => {
    expect(
      getVisibilityLabel('featureFlags.IS_MESSAGES_TAB_ENABLED', labels),
    ).toBe('Any device');
    expect(
      getVisibilityLabel(
        '(featureFlags.IS_MESSAGES_TAB_ENABLED) and (device == "DESKTOP")',
        labels,
      ),
    ).toBe('Desktop');
  });
});
