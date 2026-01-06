import { AGGREGATE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/AggregateChartSettings';
import { GAUGE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/GaugeChartSettings';
import { LINE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/LineChartSettings';
import { PIE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/PieChartSettings';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { GraphType } from '@/command-menu/pages/page-layout/types/GraphType';
import { getBarChartSettings } from '@/command-menu/pages/page-layout/utils/getBarChartSettings';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconChartBar,
  IconChartBarHorizontal,
  IconChartLine,
  IconChartPie,
  type IconComponent,
  IconGauge,
  IconSum,
} from 'twenty-ui/display';
import { BarChartLayout } from '~/generated/graphql';

export const GRAPH_TYPE_INFORMATION: Record<
  GraphType,
  {
    label: MessageDescriptor;
    icon: IconComponent;
    settings: ChartSettingsGroup[];
  }
> = {
  [GraphType.VERTICAL_BAR]: {
    label: msg`Vertical Bar Chart`,
    icon: IconChartBar,
    settings: getBarChartSettings(BarChartLayout.VERTICAL),
  },
  [GraphType.HORIZONTAL_BAR]: {
    label: msg`Horizontal Bar Chart`,
    icon: IconChartBarHorizontal,
    settings: getBarChartSettings(BarChartLayout.HORIZONTAL),
  },
  [GraphType.PIE]: {
    label: msg`Pie Chart`,
    icon: IconChartPie,
    settings: PIE_CHART_SETTINGS,
  },
  [GraphType.LINE]: {
    label: msg`Line Chart`,
    icon: IconChartLine,
    settings: LINE_CHART_SETTINGS,
  },
  [GraphType.AGGREGATE]: {
    label: msg`Aggregate Chart`,
    icon: IconSum,
    settings: AGGREGATE_CHART_SETTINGS,
  },
  [GraphType.GAUGE]: {
    label: msg`Gauge Chart`,
    icon: IconGauge,
    settings: GAUGE_CHART_SETTINGS,
  },
};
