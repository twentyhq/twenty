import {
  type GraphQLFieldConfigArgumentMap,
  type GraphQLFieldConfigMap,
  type GraphQLOutputType,
} from 'graphql';

export type GraphQLOutputTypeFieldConfigMap = GraphQLFieldConfigMap<
  string,
  {
    type: GraphQLOutputType;
    description: string | null;
  }
>;

export type GraphQLRootTypeFieldConfigMap = GraphQLFieldConfigMap<
  string,
  {
    type: GraphQLOutputType;
    args: GraphQLFieldConfigArgumentMap;
    resolve: undefined;
  }
>;
