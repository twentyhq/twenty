import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';

export type CommonSelectedFields = {
  // Scalars and join columns; a composite field lists its sub-fields
  fields: Record<string, boolean | Record<string, boolean>>;
  aggregates: string[];
  relations: Record<string, CommonSelectedRelation>;
};

export type CommonSelectedRelation = {
  fieldName: string;
  arguments?: Record<string, unknown>;
  selectedFields: CommonSelectedFields;
};

export type CommonSelectedFieldsResult = CommonSelection & {
  relationFieldsCount: number;
  hasAtLeastTwoNestedOneToManyRelations: boolean;
};
