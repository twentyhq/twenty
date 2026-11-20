import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';

import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { getWidgetVisibilityOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityOptionId';
import { getWidgetVisibilityPropertiesFromOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityPropertiesFromOptionId';

describe('getWidgetVisibilityOptionId', () => {
  it.each([VISIBILITY_ANY_DEVICE, VISIBILITY_MOBILE, VISIBILITY_DESKTOP])(
    'should read back the tree written for %s',
    (visibilityOptionId) => {
      expect(
        getWidgetVisibilityOptionId(
          getWidgetVisibilityPropertiesFromOptionId(visibilityOptionId),
        ),
      ).toBe(visibilityOptionId);
    },
  );

  it('should show any device for a tree that is not a device rule', () => {
    expect(
      getWidgetVisibilityOptionId({
        conditionalAvailabilityExpression: null,
        conditionalAvailability: { type: 'VARIABLE', path: 'featureFlags.A' },
      }),
    ).toBe(VISIBILITY_ANY_DEVICE);
  });

  it('should let a stored expression win over the tree', () => {
    expect(
      getWidgetVisibilityOptionId({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalAvailability: buildDeviceConditionalAvailability('DESKTOP'),
      }),
    ).toBe(VISIBILITY_MOBILE);
  });

  it('should show any device when the widget has no rule', () => {
    expect(getWidgetVisibilityOptionId(undefined)).toBe(VISIBILITY_ANY_DEVICE);
  });
});
