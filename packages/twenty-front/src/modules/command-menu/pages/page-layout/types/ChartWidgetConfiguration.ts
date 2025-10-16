import {
  type IframeConfiguration,
  type WidgetConfiguration,
} from '~/generated/graphql';

export type ChartWidgetConfiguration = Exclude<
  WidgetConfiguration,
  IframeConfiguration
>;
