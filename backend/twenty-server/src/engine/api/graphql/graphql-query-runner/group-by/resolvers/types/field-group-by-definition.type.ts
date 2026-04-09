import { type CompositeFieldGroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/composite-field-group-by-definition.type';
import { type DateFieldGroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/date-field-group-by-definition.type';

export type FieldGroupByDefinition =
  | boolean
  | CompositeFieldGroupByDefinition
  | DateFieldGroupByDefinition
  | undefined;
