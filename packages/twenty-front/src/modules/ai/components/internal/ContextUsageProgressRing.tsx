import { ProgressRing } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

type ContextUsageProgressRingProps = {
  percentage: number;
};

export const ContextUsageProgressRing = ({
  percentage,
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
      aria-hidden
      barColor={barColor}
      render={<span />}
    />
  );
};
