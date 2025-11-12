import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { type ChartWidgetConfiguration } from '@/command-menu/pages/page-layout/types/ChartWidgetConfiguration';
import { type ModifiedProperties } from 'twenty-shared/types';
import { type PageLayoutWidget, type WidgetType } from '~/generated/graphql';

export type ChartWidget = ModifiedProperties<
  PageLayoutWidget,
  {
    type: WidgetType.GRAPH;
    configuration: ModifiedProperties<
      ChartWidgetConfiguration,
      { filter?: ChartFilters }
    >;
  }
>;
