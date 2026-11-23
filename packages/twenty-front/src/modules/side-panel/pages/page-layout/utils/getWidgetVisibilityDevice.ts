import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';
import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const getWidgetVisibilityDevice = (
  widget:
    | Pick<
        PageLayoutWidget,
        'conditionalAvailabilityExpression' | 'conditionalAvailability'
      >
    | undefined,
): WidgetVisibilityDevice => {
  // TODO(@neo773): the legacy text rule is read for widgets not converted yet; drop these three checks one release after stored rules are converted to trees
  const legacyExpression = widget?.conditionalAvailabilityExpression;

  if (legacyExpression === EXPRESSION_DEVICE_MOBILE) {
    return 'MOBILE';
  }

  if (legacyExpression === EXPRESSION_DEVICE_DESKTOP) {
    return 'DESKTOP';
  }

  if (isDefined(legacyExpression)) {
    return 'ANY_DEVICE';
  }

  if (
    isDeeplyEqual(
      widget?.conditionalAvailability,
      buildDeviceConditionalAvailability('MOBILE'),
      { strict: true },
    )
  ) {
    return 'MOBILE';
  }

  if (
    isDeeplyEqual(
      widget?.conditionalAvailability,
      buildDeviceConditionalAvailability('DESKTOP'),
      { strict: true },
    )
  ) {
    return 'DESKTOP';
  }

  return 'ANY_DEVICE';
};
