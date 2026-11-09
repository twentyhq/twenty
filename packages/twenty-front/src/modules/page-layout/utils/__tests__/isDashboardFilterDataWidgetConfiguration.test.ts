import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { isDashboardFilterDataWidgetConfiguration } from '@/page-layout/utils/isDashboardFilterDataWidgetConfiguration';

const DATA_WIDGET_TYPENAMES: DashboardFilterWidgetConfiguration['__typename'][] =
  [
    'AggregateChartConfiguration',
    'BarChartConfiguration',
    'LineChartConfiguration',
    'PieChartConfiguration',
    'RecordTableConfiguration',
  ];

describe('isDashboardFilterDataWidgetConfiguration', () => {
  it.each(DATA_WIDGET_TYPENAMES)('should accept a %s', (__typename) => {
    expect(isDashboardFilterDataWidgetConfiguration({ __typename })).toBe(true);
  });

  it('should reject a widget that shows no records', () => {
    expect(
      isDashboardFilterDataWidgetConfiguration({
        __typename: 'IframeConfiguration',
      }),
    ).toBe(false);
  });
});
