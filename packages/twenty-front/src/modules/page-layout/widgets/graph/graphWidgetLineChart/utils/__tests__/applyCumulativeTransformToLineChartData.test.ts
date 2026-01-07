import { applyCumulativeTransformToLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/applyCumulativeTransformToLineChartData';

describe('applyCumulativeTransformToLineChartData', () => {
  const testCases = [
    {
      name: 'basic accumulation',
      data: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 30 },
      ],
    },
    {
      name: 'filter below rangeMin',
      data: [
        { x: 'a', y: 10 },
        { x: 'b', y: 10 },
        { x: 'c', y: 10 },
      ],
      rangeMin: 15,
    },
    {
      name: 'filter above rangeMax',
      data: [
        { x: 'a', y: 10 },
        { x: 'b', y: 20 },
        { x: 'c', y: 30 },
      ],
      rangeMax: 25,
    },
    {
      name: 'empty data',
      data: [],
    },
    {
      name: 'skip null y values',
      data: [
        { x: 'a', y: 10 },
        { x: 'b', y: null },
        { x: 'c', y: 20 },
      ],
    },
  ];

  it.each(testCases)('should handle $name', ({ data, rangeMin, rangeMax }) => {
    const result = applyCumulativeTransformToLineChartData({
      data,
      rangeMin,
      rangeMax,
    });

    expect(result).toMatchSnapshot();
  });
});
