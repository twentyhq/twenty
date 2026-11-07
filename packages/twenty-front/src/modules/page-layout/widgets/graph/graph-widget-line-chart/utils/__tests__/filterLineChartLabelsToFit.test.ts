import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { filterLineChartLabelsToFit } from '@/page-layout/widgets/graph/graph-widget-line-chart/utils/filterLineChartLabelsToFit';
import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';

const createLabel = (
  overrides: Partial<GraphLabelData> & Pick<GraphLabelData, 'x'>,
): GraphLabelData => ({
  key: `label-${overrides.x}`,
  value: 72,
  y: 50,
  shouldRenderBelow: false,
  ...overrides,
});

const TWO_CHARACTER_LABEL_MINIMUM_SPACING =
  2 *
    COMMON_CHART_CONSTANTS.DATA_LABEL_FONT_SIZE *
    COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO +
  COMMON_CHART_CONSTANTS.MINIMUM_GAP_BETWEEN_DATA_LABELS;

const createLabelsEvery = (spacing: number, count: number) =>
  Array.from({ length: count }, (_, index) =>
    createLabel({ x: index * spacing }),
  );

describe('filterLineChartLabelsToFit', () => {
  it('should return an empty array when there are no labels', () => {
    expect(filterLineChartLabelsToFit({ labels: [] })).toEqual([]);
  });

  it('should keep every label when they have enough room', () => {
    const labels = createLabelsEvery(100, 5);

    expect(filterLineChartLabelsToFit({ labels })).toEqual(labels);
  });

  it('should thin out labels that would overlap and keep the last one', () => {
    const labels = createLabelsEvery(5, 100);

    const result = filterLineChartLabelsToFit({ labels });

    expect(result.length).toBeLessThan(labels.length);
    expect(result).toContainEqual(labels[labels.length - 1]);

    const keptXPositions = result.map((label) => label.x);

    for (let index = 1; index < keptXPositions.length; index++) {
      expect(
        keptXPositions[index] - keptXPositions[index - 1],
      ).toBeGreaterThanOrEqual(TWO_CHARACTER_LABEL_MINIMUM_SPACING);
    }
  });

  it('should reserve more room for longer formatted values', () => {
    const labels = createLabelsEvery(30, 20);

    const shortResult = filterLineChartLabelsToFit({
      labels,
      formatValue: (value) => String(value),
    });
    const longResult = filterLineChartLabelsToFit({
      labels,
      formatValue: (value) => `${value} 000 000 USD`,
    });

    expect(shortResult).toHaveLength(20);
    expect(longResult.length).toBeLessThan(shortResult.length);
  });

  it('should keep or drop every series at the same x position together', () => {
    const labels = [0, 10, 20, 30, 40].flatMap((x) => [
      createLabel({ key: `a-${x}`, x }),
      createLabel({ key: `b-${x}`, x, y: 80 }),
    ]);

    const result = filterLineChartLabelsToFit({ labels });

    expect(result.map((label) => label.key)).toEqual([
      'a-10',
      'b-10',
      'a-40',
      'b-40',
    ]);
  });
});
