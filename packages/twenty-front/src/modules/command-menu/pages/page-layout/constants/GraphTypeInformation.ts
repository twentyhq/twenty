import { BAR_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/BarChartSettings';
import { GAUGE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/GaugeChartSettings';
import { LINE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/LineChartSettings';
import { NUMBER_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/NumberChartSettings';
import { PIE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/PieChartSettings';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  type IconComponent,
  IconGauge,
  IconNumber,
} from 'twenty-ui/display';
import { GraphType } from '~/generated-metadata/graphql';

export const GRAPH_TYPE_INFORMATION: Record<
  GraphType,
  {
    label: MessageDescriptor;
    icon: IconComponent;
    settings: ChartSettingsGroup[];
  }
> = {
  [GraphType.BAR]: {
    label: msg`Bar Chart`,
    icon: IconChartBar,
    settings: BAR_CHART_SETTINGS,
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
  [GraphType.NUMBER]: {
    label: msg`Number Chart`,
    icon: IconNumber,
    settings: NUMBER_CHART_SETTINGS,
  },
  [GraphType.GAUGE]: {
    label: msg`Gauge Chart`,
    icon: IconGauge,
    settings: GAUGE_CHART_SETTINGS,
  },
};
