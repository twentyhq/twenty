import { registerEnumType } from '@nestjs/graphql';

export enum GraphType {
  AGGREGATE = 'AGGREGATE',
  GAUGE = 'GAUGE',
  PIE = 'PIE',
  VERTICAL_BAR = 'VERTICAL_BAR',
  HORIZONTAL_BAR = 'HORIZONTAL_BAR',
  LINE = 'LINE',
}

registerEnumType(GraphType, {
  name: 'GraphType',
  description: 'Type of graph widget',
});
