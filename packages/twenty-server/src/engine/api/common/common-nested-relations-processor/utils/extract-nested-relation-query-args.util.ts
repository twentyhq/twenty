import { isPlainObject } from 'twenty-shared/utils';

import { type NestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/types/nested-relation-query-args.type';
import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type ExtractedNestedRelationQueryArgs = Omit<
  NestedRelationQueryArgs,
  'nestedRelationQueryArgsByFieldName'
>;

const isObjectRecordFilter = (value: unknown): value is ObjectRecordFilter =>
  isPlainObject(value);

const isObjectRecordOrderBy = (
  value: unknown,
): value is ObjectRecordOrderBy | ObjectRecordOrderBy[number] =>
  Array.isArray(value) || isPlainObject(value);

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

// Cursor and offset arguments stay ignored on nested relations, as they always were
export const extractNestedRelationQueryArgs = (
  graphqlArguments: unknown,
): ExtractedNestedRelationQueryArgs => {
  if (!isPlainObject(graphqlArguments)) {
    return {};
  }

  const { filter, orderBy, first } = graphqlArguments;

  return {
    ...(isObjectRecordFilter(filter) ? { filter } : {}),
    ...(isObjectRecordOrderBy(orderBy)
      ? { orderBy: Array.isArray(orderBy) ? orderBy : [orderBy] }
      : {}),
    ...(isNonNegativeInteger(first) ? { first } : {}),
  };
};
