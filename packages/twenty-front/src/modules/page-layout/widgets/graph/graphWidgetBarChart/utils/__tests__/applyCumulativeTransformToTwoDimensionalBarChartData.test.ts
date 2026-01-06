import { applyCumulativeTransformToTwoDimensionalBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/applyCumulativeTransformToTwoDimensionalBarChartData';

describe('applyCumulativeTransformToTwoDimensionalBarChartData', () => {
  const testCases = [
    {
      name: 'accumulate each key independently',
      data: [
        { id: 'Jan', sales: 10, revenue: 100 },
        { id: 'Feb', sales: 20, revenue: 200 },
        { id: 'Mar', sales: 30, revenue: 300 },
      ],
      keys: ['sales', 'revenue'],
    },
    {
      name: 'filter below rangeMin based on total sum',
      data: [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 10, y: 10 },
        { id: 'c', x: 10, y: 10 },
      ],
      keys: ['x', 'y'],
      rangeMin: 50,
    },
    {
      name: 'filter above rangeMax based on total sum',
      data: [
        { id: 'a', x: 10, y: 10 },
        { id: 'b', x: 20, y: 20 },
        { id: 'c', x: 30, y: 30 },
      ],
      keys: ['x', 'y'],
      rangeMax: 50,
    },
    {
      name: 'empty data',
      data: [],
      keys: ['x', 'y'],
    },
    {
      name: 'skip non-numeric values',
      data: [
        { id: 'a', x: 10 },
        { id: 'b', x: 'not a number' },
        { id: 'c', x: 20 },
      ],
      keys: ['x'],
    },
  ];

  it.each(testCases)(
    'should handle $name',
    ({ data, keys, rangeMin, rangeMax }) => {
      const result = applyCumulativeTransformToTwoDimensionalBarChartData({
        data,
        keys,
        rangeMin,
        rangeMax,
      });

      expect(result).toMatchSnapshot();
    },
  );
});
