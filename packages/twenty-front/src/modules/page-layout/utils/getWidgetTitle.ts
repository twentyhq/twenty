import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  BarChartLayout,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

type TitledWidgetConfigurationType =
  | WidgetConfigurationType.AGGREGATE_CHART
  | WidgetConfigurationType.PIE_CHART
  | WidgetConfigurationType.BAR_CHART
  | WidgetConfigurationType.LINE_CHART
  | WidgetConfigurationType.IFRAME
  | WidgetConfigurationType.STANDALONE_RICH_TEXT;

export const getWidgetTitle = (
  configuration: {
    configurationType: TitledWidgetConfigurationType;
    layout?: BarChartLayout;
  },
  index: number,
): string => {
  switch (configuration.configurationType) {
    case WidgetConfigurationType.AGGREGATE_CHART:
      return `${t`Aggregate Chart`} ${index + 1}`;
    case WidgetConfigurationType.PIE_CHART:
      return `${t`Pie Chart`} ${index + 1}`;
    case WidgetConfigurationType.BAR_CHART:
      if (configuration.layout === BarChartLayout.VERTICAL) {
        return `${t`Vertical Bar Chart`} ${index + 1}`;
      }
      return `${t`Horizontal Bar Chart`} ${index + 1}`;

    case WidgetConfigurationType.LINE_CHART:
      return `${t`Line Chart`} ${index + 1}`;
    case WidgetConfigurationType.IFRAME:
      return `${t`Iframe`} ${index + 1}`;
    case WidgetConfigurationType.STANDALONE_RICH_TEXT:
      return `${t`Rich Text`} ${index + 1}`;
    default:
      assertUnreachable(configuration.configurationType);
  }
};
