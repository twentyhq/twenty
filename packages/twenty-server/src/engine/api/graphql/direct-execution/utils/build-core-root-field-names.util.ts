import { type GraphQLSchema } from 'graphql';

export const buildCoreRootFieldNames = (schema: GraphQLSchema): Set<string> => {
  const rootTypes = [
    schema.getQueryType(),
    schema.getMutationType(),
    schema.getSubscriptionType(),
  ];

  return new Set(
    rootTypes.flatMap((rootType) =>
      rootType ? Object.keys(rootType.getFields()) : [],
    ),
  );
};
