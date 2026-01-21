import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import { getChartMarginsFromText } from '@/page-layout/widgets/graph/utils/getChartMarginsFromText';
import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureTextDimensions';

jest.mock('@/page-layout/widgets/graph/utils/measureTextDimensions', () => ({
  measureTextDimensions: jest.fn(),
}));

const mockedMeasureTextDimensions =
  measureTextDimensions as jest.MockedFunction<typeof measureTextDimensions>;

describe('getChartMarginsFromText', () => {
  afterEach(() => mockedMeasureTextDimensions.mockReset());

  it('clamps margins when labels are very large', () => {
    mockedMeasureTextDimensions.mockReturnValue({ width: 1000, height: 1000 });

    const result = getChartMarginsFromText({
      tickFontSize: 12,
      legendFontSize: 12,
      fontFamily: 'Inter',
      bottomTickLabels: ['a'],
      leftTickLabels: ['b'],
      xAxisLabel: 'x',
      yAxisLabel: 'y',
      tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    });

    expect(result.bottom).toBe(TEXT_MARGIN_LIMITS.max.bottom);
    expect(result.left).toBe(TEXT_MARGIN_LIMITS.max.left);
    expect(result.top).toBe(18);
    expect(result.right).toBe(18);
  });

  it('uses bottom legend offset when it exceeds tick and label blocks', () => {
    mockedMeasureTextDimensions.mockReturnValue({ width: 10, height: 10 });

    const bottomLegendOffset = 100;
    const result = getChartMarginsFromText({
      tickFontSize: 10,
      legendFontSize: 10,
      bottomTickLabels: ['a'],
      leftTickLabels: ['b'],
      xAxisLabel: 'x',
      yAxisLabel: 'y',
      tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
      bottomLegendOffset,
    });

    const expectedBottom = Math.ceil(
      bottomLegendOffset + 10 + TEXT_MARGIN_EXTRAS.tickPaddingExtra,
    );

    expect(result.bottom).toBe(expectedBottom);
  });
});
