import { GraphType } from '@/page-layout/mocks/mockWidgets';
import {
  IconChartBar,
  IconChartLine,
  IconChartPie,
  IconGauge,
  IconNumber,
} from 'twenty-ui/display';

export const GraphTypeInfo = {
  [GraphType.BAR]: {
    label: 'Bar Chart',
    icon: IconChartBar,
  },
  [GraphType.PIE]: {
    label: 'Pie Chart',
    icon: IconChartPie,
  },
  [GraphType.LINE]: {
    label: 'Line Chart',
    icon: IconChartLine,
  },
  [GraphType.NUMBER]: {
    label: 'Number Chart',
    icon: IconNumber,
  },
  [GraphType.GAUGE]: {
    label: 'Gauge Chart',
    icon: IconGauge,
  },
};
