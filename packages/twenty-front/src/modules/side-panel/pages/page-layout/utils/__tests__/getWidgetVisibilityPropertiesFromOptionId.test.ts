import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';
import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { getWidgetVisibilityPropertiesFromOptionId } from '@/side-panel/pages/page-layout/utils/getWidgetVisibilityPropertiesFromOptionId';

describe('getWidgetVisibilityPropertiesFromOptionId', () => {
  const widgetWithLegacyVisibilityRules = {
    conditionalAvailabilityExpression: 'device == "MOBILE"',
    conditionalDisplay: { '===': [{ var: 'device' }, 'MOBILE'] },
    conditionalAvailability: null,
  };

  it.each([
    [VISIBILITY_ANY_DEVICE, true],
    [VISIBILITY_MOBILE, false],
    [VISIBILITY_DESKTOP, true],
  ])(
    'should let a %s pick win over the legacy rules it clears',
    (visibilityOptionId, isVisibleOnDesktop) => {
      const widget = {
        ...widgetWithLegacyVisibilityRules,
        ...getWidgetVisibilityPropertiesFromOptionId(visibilityOptionId),
      };

      expect(widget.conditionalAvailabilityExpression).toBeNull();
      expect(widget.conditionalDisplay).toBeNull();
      expect(
        evaluateWidgetVisibility({
          ...widget,
          context: { device: 'DESKTOP', selectedRecords: [], featureFlags: {} },
        }),
      ).toBe(isVisibleOnDesktop);
    },
  );
});
