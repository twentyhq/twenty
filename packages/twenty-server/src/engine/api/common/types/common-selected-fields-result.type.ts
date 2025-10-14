import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

interface SelectedFields {
  [key: string]: boolean | SelectedFields;
}

export type CommonSelectedFieldsResult = {
  select: SelectedFields;
  relations: SelectedFields;
  //TODO = Refacto-common - to update when rest api will handle aggregates
  aggregate: Record<string, AggregationField>;
};
