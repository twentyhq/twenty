import { applyCumulativeTransformToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/applyCumulativeTransformToBarChartData';

describe('applyCumulativeTransformToBarChartData', () => {
  const testCases = [
    {
      name: 'basic accumulation',
      data: [
        { id: 'a', value: 10 },
        { id: 'b', value: 20 },
        { id: 'c', value: 30 },
      ],
      aggregateKey: 'value',
    },
    {
      name: 'filter below rangeMin',
      data: [
        { id: 'a', value: 10 },
        { id: 'b', value: 10 },
        { id: 'c', value: 10 },
      ],
      aggregateKey: 'value',
      rangeMin: 15,
    },
    {
      name: 'filter above rangeMax',
      data: [
        { id: 'a', value: 10 },
        { id: 'b', value: 20 },
        { id: 'c', value: 30 },
      ],
      aggregateKey: 'value',
      rangeMax: 25,
    },
    {
      name: 'empty data',
      data: [],
      aggregateKey: 'value',
    },
    {
      name: 'skip non-numeric values',
      data: [
        { id: 'a', value: 10 },
        { id: 'b', value: 'not a number' },
        { id: 'c', value: 20 },
      ],
      aggregateKey: 'value',
    },
  ];

  it.each(testCases)(
    'should handle $name',
    ({ data, aggregateKey, rangeMin, rangeMax }) => {
      const result = applyCumulativeTransformToBarChartData({
        data,
        aggregateKey,
        rangeMin,
        rangeMax,
      });

      expect(result).toMatchSnapshot();
    },
  );
});
