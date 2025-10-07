import { registerEnumType } from '@nestjs/graphql';

export enum GraphOrderBy {
  FIELD_ASC = 'FIELD_ASC',
  FIELD_DESC = 'FIELD_DESC',
  VALUE_ASC = 'VALUE_ASC',
  VALUE_DESC = 'VALUE_DESC',
}

registerEnumType(GraphOrderBy, {
  name: 'GraphOrderBy',
  description: 'Order by options for graph widgets',
});
