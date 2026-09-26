import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { expressionToOptionId } from '@/side-panel/pages/page-layout/utils/expressionToOptionId';

describe('expressionToOptionId', () => {
  it('should map device expressions to their option', () => {
    expect(expressionToOptionId(null)).toBe(VISIBILITY_ANY_DEVICE);
    expect(expressionToOptionId('device == "MOBILE"')).toBe(VISIBILITY_MOBILE);
    expect(expressionToOptionId('device == "DESKTOP"')).toBe(
      VISIBILITY_DESKTOP,
    );
  });

  it('should ignore the feature flag condition a layout ships with', () => {
    expect(
      expressionToOptionId('not featureFlags.IS_MESSAGES_TAB_ENABLED'),
    ).toBe(VISIBILITY_ANY_DEVICE);
    expect(
      expressionToOptionId(
        '(not featureFlags.IS_MESSAGES_TAB_ENABLED) and (device == "MOBILE")',
      ),
    ).toBe(VISIBILITY_MOBILE);
  });
});
