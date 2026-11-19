import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { conditionalAvailabilityToOptionId } from '@/side-panel/pages/page-layout/utils/conditionalAvailabilityToOptionId';
import { optionIdToConditionalAvailability } from '@/side-panel/pages/page-layout/utils/optionIdToConditionalAvailability';

describe('conditionalAvailabilityToOptionId', () => {
  it.each([VISIBILITY_ANY_DEVICE, VISIBILITY_MOBILE, VISIBILITY_DESKTOP])(
    'should read back the tree written for %s',
    (optionId) => {
      expect(
        conditionalAvailabilityToOptionId(
          optionIdToConditionalAvailability(optionId),
        ),
      ).toBe(optionId);
    },
  );

  it('should show any device for a tree that is not a device rule', () => {
    expect(
      conditionalAvailabilityToOptionId({
        type: 'PATH',
        path: 'featureFlags.A',
      }),
    ).toBe(VISIBILITY_ANY_DEVICE);
  });

  it('should show any device when the widget has no rule', () => {
    expect(conditionalAvailabilityToOptionId(undefined)).toBe(
      VISIBILITY_ANY_DEVICE,
    );
  });
});
