import { type GraphQLType } from 'graphql';

import { wrapTypeInGraphQLList } from 'src/engine/api/graphql/workspace-schema-builder/utils/wrap-type-in-graphql-list.util';

export type UpdateInputTypeOptions = {
  isArray?: boolean;
  arrayDepth?: number;
};

// Update inputs are always nullable — only array wrapping is needed
export const applyTypeOptionsForUpdateInput = <
  T extends GraphQLType = GraphQLType,
>(
  typeRef: T,
  options: UpdateInputTypeOptions,
): T => {
  if (options.isArray) {
    return wrapTypeInGraphQLList(
      typeRef,
      options.arrayDepth ?? 1,
      true,
    ) as unknown as T;
  }

  return typeRef;
};
