import { getWidgetSize } from '@/page-layout/utils/getWidgetSize';
import { WidgetConfigurationType } from '~/generated/graphql';

describe('getWidgetSize', () => {
  describe('chart types with specific sizes', () => {
    it('returns correct default size for AGGREGATE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.AGGREGATE_CHART,
        'default',
      );

      expect(result).toEqual({ w: 2, h: 2 });
    });

    it('returns correct minimum size for AGGREGATE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.AGGREGATE_CHART,
        'minimum',
      );

      expect(result).toEqual({ w: 2, h: 2 });
    });

    it('returns correct default size for GAUGE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.GAUGE_CHART,
        'default',
      );

      expect(result).toEqual({ w: 3, h: 4 });
    });

    it('returns correct minimum size for GAUGE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.GAUGE_CHART,
        'minimum',
      );

      expect(result).toEqual({ w: 3, h: 4 });
    });

    it('returns correct default size for PIE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.PIE_CHART,
        'default',
      );

      expect(result).toEqual({ w: 4, h: 4 });
    });

    it('returns correct minimum size for PIE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.PIE_CHART,
        'minimum',
      );

      expect(result).toEqual({ w: 3, h: 4 });
    });

    it('returns correct default size for BAR_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.BAR_CHART,
        'default',
      );

      expect(result).toEqual({ w: 6, h: 6 });
    });

    it('returns correct minimum size for BAR_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.BAR_CHART,
        'minimum',
      );

      expect(result).toEqual({ w: 4, h: 4 });
    });

    it('returns correct default size for LINE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.LINE_CHART,
        'default',
      );

      expect(result).toEqual({ w: 6, h: 10 });
    });

    it('returns correct minimum size for LINE_CHART', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.LINE_CHART,
        'minimum',
      );

      expect(result).toEqual({ w: 4, h: 4 });
    });
  });

  describe('fallback to default widget size', () => {
    it('returns default widget size for IFRAME', () => {
      const result = getWidgetSize(WidgetConfigurationType.IFRAME, 'default');

      expect(result).toEqual({ w: 4, h: 4 });
    });

    it('returns minimum widget size for IFRAME', () => {
      const result = getWidgetSize(WidgetConfigurationType.IFRAME, 'minimum');

      expect(result).toEqual({ w: 2, h: 2 });
    });

    it('returns default widget size for STANDALONE_RICH_TEXT', () => {
      const result = getWidgetSize(
        WidgetConfigurationType.STANDALONE_RICH_TEXT,
        'default',
      );

      expect(result).toEqual({ w: 4, h: 4 });
    });
  });
});
