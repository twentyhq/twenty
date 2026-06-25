import { type GraphQLList, GraphQLNonNull, type GraphQLType } from 'graphql';
import {
  type FieldMetadataDefaultValue,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { wrapTypeInGraphQLList } from 'src/engine/api/graphql/workspace-schema-builder/utils/wrap-type-in-graphql-list.util';

export type OutputTypeOptions = {
  nullable?: boolean;
  defaultValue?: FieldMetadataDefaultValue<FieldMetadataType>;
  isArray?: boolean;
  arrayDepth?: number;
};

export const applyTypeOptionsForOutputType = <
  T extends GraphQLType = GraphQLType,
>(
  typeRef: T,
  options: OutputTypeOptions,
): T => {
  let graphqlType: T | GraphQLList<T> | GraphQLNonNull<T> = typeRef;

  if (options.isArray) {
    graphqlType = wrapTypeInGraphQLList(
      graphqlType,
      options.arrayDepth ?? 1,
      options.nullable ?? false,
    );
  }

  if (options.nullable === false && !isDefined(options.defaultValue)) {
    graphqlType = new GraphQLNonNull(graphqlType) as unknown as T;
  }

  return graphqlType as T;
};
