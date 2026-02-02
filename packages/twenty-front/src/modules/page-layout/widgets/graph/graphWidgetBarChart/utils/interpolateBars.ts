import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

const getBarKey = (bar: BarPosition) => `${bar.indexValue}::${bar.seriesId}`;

const buildBarMap = (bars: BarPosition[]) =>
  new Map(bars.map((bar) => [getBarKey(bar), bar]));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const easeOutCubic = (t: number) =>
  1 - Math.pow(1 - t, BAR_CHART_CONSTANTS.ANIMATION_EASING_EXPONENT);

export const interpolateBars = (
  sourceBars: BarPosition[],
  targetBars: BarPosition[],
  t: number,
  toBaselineBar: (bar: BarPosition) => BarPosition,
): BarPosition[] => {
  const sourceMap = buildBarMap(sourceBars);
  const targetMap = buildBarMap(targetBars);
  const allKeys = new Set([...sourceMap.keys(), ...targetMap.keys()]);
  const eased = easeOutCubic(t);

  const result: BarPosition[] = [];

  for (const key of allKeys) {
    const fromBar = sourceMap.get(key);
    const toBar = targetMap.get(key);

    if (!fromBar && !toBar) {
      continue;
    }

    const startBar = fromBar ?? toBaselineBar(toBar as BarPosition);
    const endBar = toBar ?? toBaselineBar(fromBar as BarPosition);

    result.push({
      ...endBar,
      x: lerp(startBar.x, endBar.x, eased),
      y: lerp(startBar.y, endBar.y, eased),
      width: lerp(startBar.width, endBar.width, eased),
      height: lerp(startBar.height, endBar.height, eased),
      value: lerp(startBar.value, endBar.value, eased),
      color: endBar.color ?? startBar.color,
      seriesId: endBar.seriesId ?? startBar.seriesId,
      indexValue: endBar.indexValue ?? startBar.indexValue,
      shouldRoundFreeEnd:
        endBar.shouldRoundFreeEnd ?? startBar.shouldRoundFreeEnd,
      seriesIndex: endBar.seriesIndex ?? startBar.seriesIndex,
    });
  }

  return result;
};
