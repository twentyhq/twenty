import { AXIS_NAME_SETTING } from '@/command-menu/pages/page-layout/constants/settings/AxisNameSetting';
import { CHART_DATA_SOURCE_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ChartDataSourceSetting';
import { COLORS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/ColorsSetting';
import { DATA_DISPLAY_X_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataDisplayXSetting';
import { DATA_DISPLAY_Y_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataDisplayYSetting';
import { DATA_LABELS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DataLabelsSetting';
import { DATE_GRANULARITY_X_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DateGranularityXSetting';
import { DATE_GRANULARITY_Y_SETTING } from '@/command-menu/pages/page-layout/constants/settings/DateGranularityYSetting';
import { FILTER_SETTING } from '@/command-menu/pages/page-layout/constants/settings/FilterSetting';
import { GROUP_BY_SETTING } from '@/command-menu/pages/page-layout/constants/settings/GroupBySetting';
import { OMIT_NULL_VALUES_SETTING } from '@/command-menu/pages/page-layout/constants/settings/OmitNullValuesSetting';
import { RANGE_MAX_SETTING } from '@/command-menu/pages/page-layout/constants/settings/RangeMaxSetting';
import { RANGE_MIN_SETTING } from '@/command-menu/pages/page-layout/constants/settings/RangeMinSetting';
import { SORT_BY_GROUP_BY_FIELD_SETTING } from '@/command-menu/pages/page-layout/constants/settings/SortByGroupByFieldSetting';
import { SORT_BY_X_SETTING } from '@/command-menu/pages/page-layout/constants/settings/SortByXSetting';
import { STACKED_BARS_SETTING } from '@/command-menu/pages/page-layout/constants/settings/StackedBarsSetting';
import { IconAxisX, IconAxisY } from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';
import { getBarChartSettings } from '../getBarChartSettings';

describe('getBarChartSettings', () => {
  describe('Vertical bar chart', () => {
    it('should place primary axis items under "X axis" heading', () => {
      const result = getBarChartSettings(GraphType.VERTICAL_BAR);

      const xAxisGroup = result.find((group) => group.heading === 'X axis');

      expect(xAxisGroup).toBeDefined();
      expect(xAxisGroup?.items).toHaveLength(4);
      expect(xAxisGroup?.items[0].id).toBe(DATA_DISPLAY_X_SETTING.id);
      expect(xAxisGroup?.items[0].label).toBe(DATA_DISPLAY_X_SETTING.label);
      expect(xAxisGroup?.items[0].Icon).toBe(IconAxisX);
      expect(xAxisGroup?.items[1]).toEqual(DATE_GRANULARITY_X_SETTING);
      expect(xAxisGroup?.items[2]).toEqual(SORT_BY_X_SETTING);
      expect(xAxisGroup?.items[3]).toEqual(OMIT_NULL_VALUES_SETTING);
    });

    it('should place secondary axis items under "Y axis" heading', () => {
      const result = getBarChartSettings(GraphType.VERTICAL_BAR);

      const yAxisGroup = result.find((group) => group.heading === 'Y axis');

      expect(yAxisGroup).toBeDefined();
      expect(yAxisGroup?.items).toHaveLength(6);
      expect(yAxisGroup?.items[0].id).toBe(DATA_DISPLAY_Y_SETTING.id);
      expect(yAxisGroup?.items[0].label).toBe(DATA_DISPLAY_Y_SETTING.label);
      expect(yAxisGroup?.items[0].Icon).toBe(IconAxisY);
      expect(yAxisGroup?.items[1]).toEqual(GROUP_BY_SETTING);
      expect(yAxisGroup?.items[2]).toEqual(DATE_GRANULARITY_Y_SETTING);
      expect(yAxisGroup?.items[3]).toEqual(SORT_BY_GROUP_BY_FIELD_SETTING);
      expect(yAxisGroup?.items[4]).toEqual(RANGE_MIN_SETTING);
      expect(yAxisGroup?.items[5]).toEqual(RANGE_MAX_SETTING);
    });

    it('should have all expected groups in correct order', () => {
      const result = getBarChartSettings(GraphType.VERTICAL_BAR);

      expect(result).toHaveLength(4);
      expect(result[0].heading).toBe('Data');
      expect(result[1].heading).toBe('X axis');
      expect(result[2].heading).toBe('Y axis');
      expect(result[3].heading).toBe('Style');
    });
  });

  describe('Horizontal bar chart', () => {
    it('should place SECONDARY axis items under "X axis" heading', () => {
      const result = getBarChartSettings(GraphType.HORIZONTAL_BAR);

      const xAxisGroup = result.find((group) => group.heading === 'X axis');

      expect(xAxisGroup).toBeDefined();
      expect(xAxisGroup?.items).toHaveLength(6);
      expect(xAxisGroup?.items[0].id).toBe(DATA_DISPLAY_Y_SETTING.id);
      expect(xAxisGroup?.items[0].label).toBe(DATA_DISPLAY_Y_SETTING.label);
      expect(xAxisGroup?.items[0].Icon).toBe(IconAxisX);
      expect(xAxisGroup?.items[1]).toEqual(GROUP_BY_SETTING);
      expect(xAxisGroup?.items[2]).toEqual(DATE_GRANULARITY_Y_SETTING);
      expect(xAxisGroup?.items[3]).toEqual(SORT_BY_GROUP_BY_FIELD_SETTING);
      expect(xAxisGroup?.items[4]).toEqual(RANGE_MIN_SETTING);
      expect(xAxisGroup?.items[5]).toEqual(RANGE_MAX_SETTING);
    });

    it('should place PRIMARY axis items under "Y axis" heading', () => {
      const result = getBarChartSettings(GraphType.HORIZONTAL_BAR);

      const yAxisGroup = result.find((group) => group.heading === 'Y axis');

      expect(yAxisGroup).toBeDefined();
      expect(yAxisGroup?.items).toHaveLength(4);
      expect(yAxisGroup?.items[0].id).toBe(DATA_DISPLAY_X_SETTING.id);
      expect(yAxisGroup?.items[0].label).toBe(DATA_DISPLAY_X_SETTING.label);
      expect(yAxisGroup?.items[0].Icon).toBe(IconAxisY);
      expect(yAxisGroup?.items[1]).toEqual(DATE_GRANULARITY_X_SETTING);
      expect(yAxisGroup?.items[2]).toEqual(SORT_BY_X_SETTING);
      expect(yAxisGroup?.items[3]).toEqual(OMIT_NULL_VALUES_SETTING);
    });

    it('should have all expected groups in correct order', () => {
      const result = getBarChartSettings(GraphType.HORIZONTAL_BAR);

      expect(result).toHaveLength(4);
      expect(result[0].heading).toBe('Data');
      expect(result[1].heading).toBe('X axis');
      expect(result[2].heading).toBe('Y axis');
      expect(result[3].heading).toBe('Style');
    });
  });

  describe('Common groups', () => {
    it('should have consistent Data group for both orientations', () => {
      const verticalResult = getBarChartSettings(GraphType.VERTICAL_BAR);
      const horizontalResult = getBarChartSettings(GraphType.HORIZONTAL_BAR);

      const verticalDataGroup = verticalResult.find(
        (group) => group.heading === 'Data',
      );
      const horizontalDataGroup = horizontalResult.find(
        (group) => group.heading === 'Data',
      );

      expect(verticalDataGroup?.items).toEqual(horizontalDataGroup?.items);
      expect(verticalDataGroup?.items).toEqual([
        CHART_DATA_SOURCE_SETTING,
        FILTER_SETTING,
      ]);
    });

    it('should have consistent Style group for both orientations', () => {
      const verticalResult = getBarChartSettings(GraphType.VERTICAL_BAR);
      const horizontalResult = getBarChartSettings(GraphType.HORIZONTAL_BAR);

      const verticalStyleGroup = verticalResult.find(
        (group) => group.heading === 'Style',
      );
      const horizontalStyleGroup = horizontalResult.find(
        (group) => group.heading === 'Style',
      );

      expect(verticalStyleGroup?.items).toEqual(horizontalStyleGroup?.items);
      expect(verticalStyleGroup?.items).toEqual([
        COLORS_SETTING,
        AXIS_NAME_SETTING,
        STACKED_BARS_SETTING,
        DATA_LABELS_SETTING,
      ]);
    });
  });
});
