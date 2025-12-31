import { type ChartWidgetConfiguration } from '@/command-menu/pages/page-layout/types/ChartWidgetConfiguration';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type ModifiedProperties } from 'twenty-shared/types';
import { type WidgetType } from '~/generated/graphql';

export type ChartWidget = ModifiedProperties<
  PageLayoutWidget,
  {
    type: WidgetType.GRAPH;
    configuration: ChartWidgetConfiguration;
  }
>;
