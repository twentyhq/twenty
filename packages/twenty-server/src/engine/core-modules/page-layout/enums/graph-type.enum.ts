import { registerEnumType } from '@nestjs/graphql';

export enum GraphType {
  NUMBER = 'NUMBER',
  GAUGE = 'GAUGE',
  PIE = 'PIE',
  BAR = 'BAR',
  LINE = 'LINE',
}

registerEnumType(GraphType, {
  name: 'GraphType',
  description: 'Type of graph widget',
});
