import { getEffectiveGroupMode } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getEffectiveGroupMode';
import { BarChartGroupMode } from '~/generated-metadata/graphql';

describe('getEffectiveGroupMode', () => {
  describe('without secondary axis grouping', () => {
    it('should return undefined when hasGroupByOnSecondaryAxis is false', () => {
      expect(
        getEffectiveGroupMode(BarChartGroupMode.GROUPED, false),
      ).toBeUndefined();
    });

    it('should return undefined regardless of groupMode when no secondary axis', () => {
      expect(
        getEffectiveGroupMode(BarChartGroupMode.STACKED, false),
      ).toBeUndefined();
      expect(getEffectiveGroupMode(null, false)).toBeUndefined();
      expect(getEffectiveGroupMode(undefined, false)).toBeUndefined();
    });
  });

  describe('with secondary axis grouping', () => {
    it('should return "grouped" when groupMode is GROUPED', () => {
      expect(getEffectiveGroupMode(BarChartGroupMode.GROUPED, true)).toBe(
        'grouped',
      );
    });

    it('should return "stacked" when groupMode is STACKED', () => {
      expect(getEffectiveGroupMode(BarChartGroupMode.STACKED, true)).toBe(
        'stacked',
      );
    });

    it('should return "stacked" when groupMode is null', () => {
      expect(getEffectiveGroupMode(null, true)).toBe('stacked');
    });

    it('should return "stacked" when groupMode is undefined', () => {
      expect(getEffectiveGroupMode(undefined, true)).toBe('stacked');
    });
  });
});
