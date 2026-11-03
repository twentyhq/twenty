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
    const labels = [0, 5, 10, 15].flatMap((x) => [
      createLabel({ key: `a-${x}`, x }),
      createLabel({ key: `b-${x}`, x, y: 80 }),
    ]);

    const result = filterLineChartLabelsToFit({ labels });

    expect(result.map((label) => label.key)).toEqual(['a-15', 'b-15']);
  });
});
