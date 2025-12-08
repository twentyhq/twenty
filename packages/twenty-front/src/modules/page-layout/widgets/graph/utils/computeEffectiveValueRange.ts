import { isDefined } from 'twenty-shared/utils';

const POSITIVE_RANGE_PADDING_RATIO = 0.1;
const MINIMUM_POSITIVE_RANGE_PADDING = 1;

type ComputeEffectiveValueRangeParams = {
  calculatedMinimum: number;
  calculatedMaximum: number;
  rangeMin?: number;
  rangeMax?: number;
  dataLength: number;
};

type EffectiveValueRangeResult = {
  effectiveMinimumValue: number;
  effectiveMaximumValue: number;
  hasNoData: boolean;
};

export const computeEffectiveValueRange = ({
  calculatedMinimum,
  calculatedMaximum,
  rangeMin,
  rangeMax,
  dataLength,
}: ComputeEffectiveValueRangeParams): EffectiveValueRangeResult => {
  const hasOnlyNonNegativeValues =
    calculatedMinimum >= 0 && calculatedMaximum >= 0;
  const hasNoData = dataLength === 0;

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
          Math.abs(positiveRangePaddingTarget) * POSITIVE_RANGE_PADDING_RATIO,
          MINIMUM_POSITIVE_RANGE_PADDING,
        );

  let effectiveMinimumValue = baseMinimumValue;
  let effectiveMaximumValue = paddedMaximumForNonNegative;

  if (!isDefined(rangeMax) && !isDefined(rangeMin)) {
    if (effectiveMinimumValue === effectiveMaximumValue) {
      effectiveMaximumValue =
        effectiveMinimumValue + MINIMUM_POSITIVE_RANGE_PADDING;
    }
  }

  return {
    effectiveMinimumValue,
    effectiveMaximumValue,
    hasNoData,
  };
};
