import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ProgressRing } from '@/ui/feedback/progress-ring/components/ProgressRing';

type ContextUsageProgressRingProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
};

export const ContextUsageProgressRing = ({
  percentage,
  size,
  strokeWidth,
}: ContextUsageProgressRingProps) => {
  const barColor =
    percentage > 80
      ? themeCssVariables.color.red
      : percentage > 60
        ? themeCssVariables.color.orange
        : themeCssVariables.color.blue;

  return (
    <ProgressRing
      value={percentage}
      size={size}
      strokeWidth={strokeWidth}
      barColor={barColor}
    />
  );
};
