import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { computeBottomLegendOffsetFromText } from '@/page-layout/widgets/graph/utils/computeBottomLegendOffsetFromText';
import { measureTextDimensions } from '@/page-layout/widgets/graph/utils/measureTextDimensions';

jest.mock('@/page-layout/widgets/graph/utils/measureTextDimensions', () => ({
  measureTextDimensions: jest.fn(),
}));

const mockedMeasureTextDimensions =
  measureTextDimensions as jest.MockedFunction<typeof measureTextDimensions>;

describe('computeBottomLegendOffsetFromText', () => {
  afterEach(() => mockedMeasureTextDimensions.mockReset());

  it('uses tick font size when no tick labels are provided', () => {
    const tickFontSize = 12;
    const result = computeBottomLegendOffsetFromText({
      tickLabels: undefined,
      tickFontSize,
      tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    });

    expect(result).toBe(
      Math.ceil(
        tickFontSize +
          COMMON_CHART_CONSTANTS.TICK_PADDING +
          TEXT_MARGIN_EXTRAS.tickPaddingExtra +
          TEXT_MARGIN_EXTRAS.bottomTickExtraNonRotated,
      ),
    );
  });

  it('uses rotated label height when labels are rotated', () => {
    const tickFontSize = 12;
    mockedMeasureTextDimensions.mockReturnValue({ width: 100, height: 20 });

    const tickRotation = COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE;
    const result = computeBottomLegendOffsetFromText({
      tickLabels: ['abc'],
      tickFontSize,
      tickRotation,
    });

    const rotationRadians = (Math.abs(tickRotation) * Math.PI) / 180;
    const projectedHeight =
      Math.abs(100 * Math.sin(rotationRadians)) +
      Math.abs(20 * Math.cos(rotationRadians));
    const effectiveTickHeight = Math.max(20, projectedHeight);

    expect(result).toBe(
      Math.ceil(
        effectiveTickHeight +
          COMMON_CHART_CONSTANTS.TICK_PADDING +
          TEXT_MARGIN_EXTRAS.tickPaddingExtra +
          TEXT_MARGIN_EXTRAS.bottomTickExtraRotated,
      ),
    );
  });
});
