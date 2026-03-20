import {
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLResolveInfo,
} from 'graphql';

export const graphQLBuildPartialResolveInfo = (
  field: FieldNode,
  fragmentMap: Map<string, FragmentDefinitionNode>,
): Pick<GraphQLResolveInfo, 'fieldNodes' | 'fragments'> => ({
  fieldNodes: [field],
  fragments: Object.fromEntries(fragmentMap),
});
