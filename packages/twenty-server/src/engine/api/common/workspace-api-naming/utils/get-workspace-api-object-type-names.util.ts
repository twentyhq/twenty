import {
  getConnectionTypename,
  getEdgeTypename,
  getGroupByConnectionTypename,
  getNodeTypename,
} from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';

const RELATION_INPUT_TYPE_SUFFIXES = [
  'RelationInput',
  'ConnectInput',
  'WhereUniqueInput',
];
const INPUT_TYPE_KINDS = Object.values(GqlInputTypeDefinitionKind);

export const getWorkspaceApiObjectTypeNames = (
  objectNameSingular: string,
): string[] => {
  const nodeTypeName = getNodeTypename(objectNameSingular);

  return [
    nodeTypeName,
    getConnectionTypename(objectNameSingular),
    getEdgeTypename(objectNameSingular),
    getGroupByConnectionTypename(objectNameSingular),
    ...INPUT_TYPE_KINDS.map((kind) => `${nodeTypeName}${kind}Input`),
    ...RELATION_INPUT_TYPE_SUFFIXES.map((suffix) => `${nodeTypeName}${suffix}`),
    `${nodeTypeName}${GqlInputTypeDefinitionKind.OrderByWithGroupBy}AggregateInput`,
  ];
};
