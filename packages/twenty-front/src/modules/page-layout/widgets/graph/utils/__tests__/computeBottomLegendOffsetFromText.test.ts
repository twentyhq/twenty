import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_EXTRAS } from '@/page-layout/widgets/graph/constants/TextMarginExtras';
import { computeBottomLegendOffsetFromText } from '@/page-layout/widgets/graph/utils/computeBottomLegendOffsetFromText';

describe('computeBottomLegendOffsetFromText', () => {
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

  it('returns larger offsets for rotated labels', () => {
    const tickFontSize = 12;
    const tickLabels = ['LongLabelValue'];

    const rotated = computeBottomLegendOffsetFromText({
      tickLabels,
      tickFontSize,
      tickRotation: COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE,
    });

    const nonRotated = computeBottomLegendOffsetFromText({
      tickLabels,
      tickFontSize,
      tickRotation: COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
    });

    expect(rotated).toBeGreaterThan(nonRotated);
  });

  it('scales rotated offsets with label length', () => {
    const tickFontSize = 12;
    const tickRotation = COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE;

    const short = computeBottomLegendOffsetFromText({
      tickLabels: ['AB'],
      tickFontSize,
      tickRotation,
    });
    const long = computeBottomLegendOffsetFromText({
      tickLabels: ['AB'.repeat(12)],
      tickFontSize,
      tickRotation,
    });

    expect(long).toBeGreaterThan(short);
  });
});
