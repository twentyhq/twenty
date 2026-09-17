import { themeCssVariables } from 'twenty-ui/theme-constants';

export const getUsageLimitRingColor = ({
  consumedPercentage,
  isExhausted,
}: {
  consumedPercentage: number;
  isExhausted: boolean;
}): string => {
  if (isExhausted || consumedPercentage > 80) {
    return themeCssVariables.color.red;
  }

  if (consumedPercentage > 60) {
    return themeCssVariables.color.orange;
  }

  return themeCssVariables.color.blue;
};
