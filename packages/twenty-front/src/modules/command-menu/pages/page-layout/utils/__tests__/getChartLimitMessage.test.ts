import { getChartLimitMessage } from '@/command-menu/pages/page-layout/utils/getChartLimitMessage';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated/graphql';

describe('getChartLimitMessage', () => {
  it('returns date-based message for bar chart with date axis', () => {
    const result = getChartLimitMessage({
      widgetConfigurationType: WidgetConfigurationType.BAR_CHART,
      isPrimaryAxisDate: true,
      primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
    });

    expect(result).toContain('Undisplayed data');
    expect(result).toContain('days');
    expect(result).toContain('per chart');
  });

  it('returns bars message for bar chart without date axis', () => {
    const result = getChartLimitMessage({
      widgetConfigurationType: WidgetConfigurationType.BAR_CHART,
      isPrimaryAxisDate: false,
      primaryAxisDateGranularity: null,
    });

    expect(result).toContain('bars per chart');
  });

  it('returns data points message for line chart without date axis', () => {
    const result = getChartLimitMessage({
      widgetConfigurationType: WidgetConfigurationType.LINE_CHART,
      isPrimaryAxisDate: false,
      primaryAxisDateGranularity: null,
    });

    expect(result).toContain('data points per chart');
  });

  it('returns slices message for pie chart', () => {
    const result = getChartLimitMessage({
      widgetConfigurationType: WidgetConfigurationType.PIE_CHART,
      isPrimaryAxisDate: false,
      primaryAxisDateGranularity: null,
    });

    expect(result).toContain('slices per chart');
  });

  it('returns date-based message with weeks granularity', () => {
    const result = getChartLimitMessage({
      widgetConfigurationType: WidgetConfigurationType.LINE_CHART,
      isPrimaryAxisDate: true,
      primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.WEEK,
    });

    expect(result).toContain('weeks');
  });

  it('returns slices message when isPrimaryAxisDate is true but granularity is null', () => {
    const result = getChartLimitMessage({
      widgetConfigurationType: WidgetConfigurationType.PIE_CHART,
      isPrimaryAxisDate: true,
      primaryAxisDateGranularity: null,
    });

    expect(result).toContain('slices per chart');
  });
});
