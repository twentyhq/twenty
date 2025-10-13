import { GAUGE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/GaugeChartSettings';
import { LINE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/LineChartSettings';
import { NUMBER_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/NumberChartSettings';
import { PIE_CHART_SETTINGS } from '@/command-menu/pages/page-layout/constants/PieChartSettings';
import { type ChartSettingsGroup } from '@/command-menu/pages/page-layout/types/ChartSettingsGroup';
import { getBarChartSettings } from '@/command-menu/pages/page-layout/utils/getBarChartSettings';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  Icon123,
  IconChartBar,
  IconChartBarHorizontal,
  IconChartLine,
  IconChartPie,
  type IconComponent,
  IconGauge,
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
  [GraphType.VERTICAL_BAR]: {
    label: msg`Vertical Bar`,
    icon: IconChartBar,
    settings: getBarChartSettings(GraphType.VERTICAL_BAR),
  },
  [GraphType.HORIZONTAL_BAR]: {
    label: msg`Horizontal Bar`,
    icon: IconChartBarHorizontal,
    settings: getBarChartSettings(GraphType.HORIZONTAL_BAR),
  },
  [GraphType.PIE]: {
    label: msg`Pie`,
    icon: IconChartPie,
    settings: PIE_CHART_SETTINGS,
  },
  [GraphType.LINE]: {
    label: msg`Line`,
    icon: IconChartLine,
    settings: LINE_CHART_SETTINGS,
  },
  [GraphType.NUMBER]: {
    label: msg`Number`,
    icon: Icon123,
    settings: NUMBER_CHART_SETTINGS,
  },
  [GraphType.GAUGE]: {
    label: msg`Gauge`,
    icon: IconGauge,
    settings: GAUGE_CHART_SETTINGS,
  },
};
