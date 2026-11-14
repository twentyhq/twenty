import { type NestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args.type';

export type NestedRelationQueryArgsByFieldName = Partial<
  Record<string, NestedRelationQueryArgs>
>;
