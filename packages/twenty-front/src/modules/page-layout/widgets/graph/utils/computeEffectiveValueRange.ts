import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { isDefined } from 'twenty-shared/utils';

type ComputeEffectiveValueRangeParams = {
  calculatedMinimum: number;
  calculatedMaximum: number;
  rangeMin?: number;
  rangeMax?: number;
};

type EffectiveValueRangeResult = {
  effectiveMinimumValue: number;
  effectiveMaximumValue: number;
};

export const computeEffectiveValueRange = ({
  calculatedMinimum,
  calculatedMaximum,
  rangeMin,
  rangeMax,
}: ComputeEffectiveValueRangeParams): EffectiveValueRangeResult => {
  const hasOnlyNonNegativeValues =
    calculatedMinimum >= 0 && calculatedMaximum >= 0;

  const baseMinimumValue = isDefined(rangeMin)
    ? rangeMin
    : hasOnlyNonNegativeValues
      ? 0
      : calculatedMinimum;

  const positiveRangePaddingTarget = isDefined(rangeMax)
    ? rangeMax
    : calculatedMaximum;

  const paddedMaximumForNonNegative =
    isDefined(rangeMax) || !hasOnlyNonNegativeValues
      ? positiveRangePaddingTarget
      : positiveRangePaddingTarget +
        Math.max(
          Math.abs(positiveRangePaddingTarget) *
            COMMON_CHART_CONSTANTS.POSITIVE_RANGE_PADDING_RATIO,
          COMMON_CHART_CONSTANTS.MINIMUM_POSITIVE_RANGE_PADDING,
        );

  let effectiveMinimumValue = baseMinimumValue;
  let effectiveMaximumValue = paddedMaximumForNonNegative;

  if (!isDefined(rangeMax) && !isDefined(rangeMin)) {
    if (effectiveMinimumValue === effectiveMaximumValue) {
      effectiveMaximumValue =
        effectiveMinimumValue +
        COMMON_CHART_CONSTANTS.MINIMUM_POSITIVE_RANGE_PADDING;
    }
  }

  return {
    effectiveMinimumValue,
    effectiveMaximumValue,
  };
};
