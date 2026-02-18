import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartInnerPadding';
import { BarChartLayout } from '~/generated-metadata/graphql';

describe('getBarChartInnerPadding', () => {
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };

  describe('non-grouped mode', () => {
    it('should return 0 when groupMode is undefined', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 500,
        chartHeight: 300,
        dataLength: 5,
        keysLength: 3,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: undefined,
      });

      expect(result).toBe(0);
    });

    it('should return 0 when groupMode is stacked', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 500,
        chartHeight: 300,
        dataLength: 5,
        keysLength: 3,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'stacked',
      });

      expect(result).toBe(0);
    });
  });

  describe('grouped mode with empty data', () => {
    it('should return default inner padding when dataLength is 0', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 500,
        chartHeight: 300,
        dataLength: 0,
        keysLength: 3,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBe(BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING);
    });

    it('should return default inner padding when keysLength is 0', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 500,
        chartHeight: 300,
        dataLength: 5,
        keysLength: 0,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBe(BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING);
    });
  });

  describe('grouped mode with vertical layout', () => {
    it('should calculate inner padding based on available horizontal space', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 800,
        chartHeight: 400,
        dataLength: 5,
        keysLength: 2,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return default padding when there is enough space', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 1000,
        chartHeight: 400,
        dataLength: 3,
        keysLength: 2,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBe(BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING);
    });
  });

  describe('grouped mode with horizontal layout', () => {
    it('should calculate inner padding based on available vertical space', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 500,
        chartHeight: 600,
        dataLength: 5,
        keysLength: 2,
        layout: BarChartLayout.HORIZONTAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('tight space constraints', () => {
    it('should reduce padding when space per bar is limited', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 200,
        chartHeight: 300,
        dataLength: 10,
        keysLength: 5,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBeLessThanOrEqual(
        BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING,
      );
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should not return negative padding', () => {
      const result = getBarChartInnerPadding({
        chartWidth: 100,
        chartHeight: 100,
        dataLength: 50,
        keysLength: 10,
        layout: BarChartLayout.VERTICAL,
        margins: defaultMargins,
        groupMode: 'grouped',
      });

      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
