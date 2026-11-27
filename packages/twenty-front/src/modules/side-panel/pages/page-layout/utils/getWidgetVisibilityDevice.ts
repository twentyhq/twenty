import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';
import { type WidgetVisibilityDevice } from '@/side-panel/pages/page-layout/types/WidgetVisibilityDevice';
import { buildDeviceConditionalEvaluationNode } from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type GetWidgetVisibilityDeviceParams = {
  widget:
    | Pick<
        PageLayoutWidget,
        'conditionalAvailabilityExpression' | 'conditionalAvailability'
      >
    | undefined;
  isWidgetConditionalAvailabilityEnabled: boolean;
};

export const getWidgetVisibilityDevice = ({
  widget,
  isWidgetConditionalAvailabilityEnabled,
}: GetWidgetVisibilityDeviceParams): WidgetVisibilityDevice => {
  // TODO(@neo773): a workspace without the flag still reads its legacy text rule; drop these three checks with the two legacy rule columns
  const legacyExpression = isWidgetConditionalAvailabilityEnabled
    ? undefined
    : widget?.conditionalAvailabilityExpression;

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
      buildDeviceConditionalEvaluationNode('MOBILE'),
      { strict: true },
    )
  ) {
    return 'MOBILE';
  }

  if (
    isDeeplyEqual(
      widget?.conditionalAvailability,
      buildDeviceConditionalEvaluationNode('DESKTOP'),
      { strict: true },
    )
  ) {
    return 'DESKTOP';
  }

  return 'ANY_DEVICE';
};
