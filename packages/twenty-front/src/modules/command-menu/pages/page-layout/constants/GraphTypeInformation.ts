import { AGGREGATE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/AggregateChartSettings';
import { GAUGE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/GaugeChartSettings';
import { LINE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/LineChartSettings';
import { PIE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/PieChartSettings';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { getBarChartSettings } from '@/command-menu/pages/page-layout/utils/getBarChartSettings';
import {
  IconChartBar,
  IconChartBarHorizontal,
  IconChartLine,
  IconChartPie,
  type IconComponent,
  IconGauge,
  IconSum,
} from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';

export const GRAPH_TYPE_INFORMATION: Record<
  GraphType,
  {
    icon: IconComponent;
    settings: ChartSettingsGroup[];
  }
> = {
  [GraphType.VERTICAL_BAR]: {
    icon: IconChartBar,
    settings: getBarChartSettings(GraphType.VERTICAL_BAR),
  },
  [GraphType.HORIZONTAL_BAR]: {
    icon: IconChartBarHorizontal,
    settings: getBarChartSettings(GraphType.HORIZONTAL_BAR),
  },
  [GraphType.PIE]: {
    icon: IconChartPie,
    settings: PIE_CHART_SETTINGS,
  },
  [GraphType.LINE]: {
    icon: IconChartLine,
    settings: LINE_CHART_SETTINGS,
  },
  [GraphType.AGGREGATE]: {
    icon: IconSum,
    settings: AGGREGATE_CHART_SETTINGS,
  },
  [GraphType.GAUGE]: {
    icon: IconGauge,
    settings: GAUGE_CHART_SETTINGS,
  },
};
