import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { isDefined } from 'twenty-shared/utils';

const estimateDataLabelWidth = (text: string) =>
  text.length *
  COMMON_CHART_CONSTANTS.DATA_LABEL_FONT_SIZE *
  COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;

// Walks from the last x position so the most recent value always stays labeled.
export const filterLineChartLabelsToFit = ({
  labels,
  formatValue,
}: {
  labels: GraphLabelData[];
  formatValue?: (value: number) => string;
}): GraphLabelData[] => {
  if (labels.length === 0) {
    return labels;
  }

  const widestLabelWidth = Math.max(
    ...labels.map((label) =>
      estimateDataLabelWidth(
        isDefined(formatValue) ? formatValue(label.value) : String(label.value),
      ),
    ),
  );

  const minimumSpacing =
    widestLabelWidth + COMMON_CHART_CONSTANTS.MINIMUM_GAP_BETWEEN_DATA_LABELS;

  const xPositionsFromLast = [...new Set(labels.map((label) => label.x))].sort(
    (first, second) => second - first,
  );

  const keptXPositions = new Set<number>();
  let lastKeptXPosition: number | undefined;

  for (const xPosition of xPositionsFromLast) {
    if (
      !isDefined(lastKeptXPosition) ||
      lastKeptXPosition - xPosition >= minimumSpacing
    ) {
      keptXPositions.add(xPosition);
      lastKeptXPosition = xPosition;
    }
  }

  return labels.filter((label) => keptXPositions.has(label.x));
};
