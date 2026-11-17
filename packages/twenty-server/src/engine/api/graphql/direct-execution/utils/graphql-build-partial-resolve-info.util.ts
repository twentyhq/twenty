import {
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLResolveInfo,
} from 'graphql';

export const graphQLBuildPartialResolveInfo = ({
  field,
  fragmentMap,
  variableValues,
}: {
  field: FieldNode;
  fragmentMap: Map<string, FragmentDefinitionNode>;
  variableValues: GraphQLResolveInfo['variableValues'];
}): Pick<
  GraphQLResolveInfo,
  'fieldNodes' | 'fragments' | 'variableValues'
> => ({
  fieldNodes: [field],
  fragments: Object.fromEntries(fragmentMap),
  variableValues,
});
