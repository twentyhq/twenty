import { registerEnumType } from '@nestjs/graphql';

export enum GraphLayoutType {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

registerEnumType(GraphLayoutType, {
  name: 'GraphLayoutType',
  description: 'Layout for the graph charts',
});
