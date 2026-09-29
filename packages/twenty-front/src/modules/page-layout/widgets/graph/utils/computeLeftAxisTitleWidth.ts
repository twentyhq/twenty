import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { isNonEmptyString } from '@sniptt/guards';

export const computeLeftAxisTitleWidth = ({
  yAxisLabel,
  legendFontSize,
}: {
  yAxisLabel?: string;
  legendFontSize: number;
}): number =>
  isNonEmptyString(yAxisLabel)
    ? legendFontSize + TEXT_MARGIN_EXTRAS.tickPaddingExtra
    : 0;
