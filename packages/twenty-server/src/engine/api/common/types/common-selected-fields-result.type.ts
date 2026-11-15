import { type CommonRelationSelections } from 'src/engine/api/common/types/common-relation-selection.type';
import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export interface CommonSelectedFields {
  [key: string]: boolean | CommonSelectedFields;
}

export type CommonSelectedFieldsResult = {
  select: CommonSelectedFields;
  relationSelections: CommonRelationSelections;
  aggregate: Record<string, AggregationField>;
  relationFieldsCount?: number;
  hasAtLeastTwoNestedOneToManyRelations?: boolean;
};
