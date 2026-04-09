import { registerEnumType } from '@nestjs/graphql';

export enum BarChartGroupMode {
  STACKED = 'STACKED',
  GROUPED = 'GROUPED',
}

registerEnumType(BarChartGroupMode, {
  name: 'BarChartGroupMode',
  description: 'Display mode for bar charts with secondary grouping',
});
