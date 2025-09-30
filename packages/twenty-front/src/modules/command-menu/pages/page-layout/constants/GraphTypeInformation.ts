import { BAR_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/BarChartSettings';
import { GAUGE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/GaugeChartSettings';
import { LINE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/LineChartSettings';
import { NUMBER_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/NumberChartSettings';
import { PIE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/PieChartSettings';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconGauge,
  IconNumber,
} from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';

export const GRAPH_TYPE_INFORMATION = {
  [GraphType.BAR]: {
    label: 'Bar Chart',
    icon: IconChartBar,
    settings: BAR_CHART_SETTINGS,
  },
  [GraphType.PIE]: {
    label: 'Pie Chart',
    icon: IconChartPie,
    settings: PIE_CHART_SETTINGS,
  },
  [GraphType.LINE]: {
    label: 'Line Chart',
    icon: IconChartLine,
    settings: LINE_CHART_SETTINGS,
  },
  [GraphType.NUMBER]: {
    label: 'Number Chart',
    icon: IconNumber,
    settings: NUMBER_CHART_SETTINGS,
  },
  [GraphType.GAUGE]: {
    label: 'Gauge Chart',
    icon: IconGauge,
    settings: GAUGE_CHART_SETTINGS,
  },
};
