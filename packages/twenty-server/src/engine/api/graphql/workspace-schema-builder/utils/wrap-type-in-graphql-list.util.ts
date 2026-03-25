import { GraphQLList, GraphQLNonNull, type GraphQLType } from 'graphql';

export const wrapTypeInGraphQLList = <T extends GraphQLType = GraphQLType>(
  targetType: T,
  depth: number,
  nullable: boolean,
): GraphQLList<T> => {
  const targetTypeNonNull = nullable
    ? targetType
    : new GraphQLNonNull(targetType);

  if (depth === 0) {
    return targetType as GraphQLList<T>;
  }

  return wrapTypeInGraphQLList<T>(
    new GraphQLList(targetTypeNonNull) as unknown as T,
    depth - 1,
    nullable,
  );
};
