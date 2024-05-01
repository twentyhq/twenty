import { GraphQLResolveInfo } from 'graphql';

export enum ExtensionResolverType {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
  OBJECT = 'OBJECT',
}

export const ExtensionResolverTypeKeyMap = {
  [ExtensionResolverType.QUERY]: 'Query',
  [ExtensionResolverType.MUTATION]: 'Mutation',
  [ExtensionResolverType.OBJECT]: null,
};

export type ExtensionServiceResolverOptionsArg = {
  workspaceId: string;
  info: GraphQLResolveInfo;
};
