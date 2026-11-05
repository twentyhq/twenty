import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import {
  getConnectionTypename,
  getEdgeTypename,
  getGroupByConnectionTypename,
  getNodeTypename,
} from 'twenty-shared/utils';

import { type WorkspaceApiNamingBindings } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-bindings.type';
import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { getWorkspaceApiAggregationFieldBindingsOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-aggregation-field-bindings-or-throw.util';
import { getWorkspaceApiFieldTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-field-type-names.util';
import { getWorkspaceApiObjectFieldBindings } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-object-field-bindings.util';
import { getWorkspaceApiObjectTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-object-type-names.util';
import { getWorkspaceApiUniqueFieldBindingsOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-unique-field-bindings-or-throw.util';
import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getWorkspaceApiObjectTypeBindingsOrThrow = ({
  flatObjectMetadata,
  fields,
  flatIndexMaps,
  view,
}: Pick<WorkspaceApiNamingMetadata, 'flatIndexMaps'> & {
  flatObjectMetadata: FlatObjectMetadata;
  fields: FlatFieldMetadata[];
  view: WorkspaceApiNamingView;
}): Pick<
  WorkspaceApiNamingBindings,
  | 'canonicalTypeNameByApiTypeName'
  | 'canonicalFieldNameByApiTypeNameAndApiFieldName'
> => {
  const apiObjectName =
    view.objects[flatObjectMetadata.universalIdentifier]?.nameSingular ??
    flatObjectMetadata.nameSingular;
  const apiNodeTypeName = getNodeTypename(apiObjectName);
  const canonicalObjectTypeNames = getWorkspaceApiObjectTypeNames(
    flatObjectMetadata.nameSingular,
  );
  const canonicalTypeNameByApiTypeName: Record<string, string> =
    Object.fromEntries(
      getWorkspaceApiObjectTypeNames(apiObjectName).map((name, index) => [
        name,
        canonicalObjectTypeNames[index],
      ]),
    );
  const objectFields = getWorkspaceApiObjectFieldBindings({ fields, view });
  const aggregationFields = getWorkspaceApiAggregationFieldBindingsOrThrow({
    fields,
    view,
  });
  const aggregationOrderFields = getWorkspaceApiAggregationFieldBindingsOrThrow(
    {
      fields: fields.filter(
        (fieldMetadata) => !isMorphOrRelationFlatFieldMetadata(fieldMetadata),
      ),
      view,
    },
  );
  const uniqueBindings = getWorkspaceApiUniqueFieldBindingsOrThrow({
    flatObjectMetadata,
    apiObjectName,
    fields,
    flatIndexMaps,
    view,
  });
  const connectionFields = {
    ...aggregationFields,
    edges: 'edges',
    pageInfo: 'pageInfo',
  };
  const canonicalFieldNameByApiTypeNameAndApiFieldName: Record<
    string,
    Record<string, string>
  > = {
    [apiNodeTypeName]: objectFields.node,
    [getConnectionTypename(apiObjectName)]: connectionFields,
    [getGroupByConnectionTypename(apiObjectName)]: {
      ...connectionFields,
      groupByDimensionValues: 'groupByDimensionValues',
    },
    [getEdgeTypename(apiObjectName)]: { cursor: 'cursor', node: 'node' },
    [computeObjectMetadataInputTypeKey(
      apiObjectName,
      GqlInputTypeDefinitionKind.Create,
    )]: { ...objectFields.input },
    [computeObjectMetadataInputTypeKey(
      apiObjectName,
      GqlInputTypeDefinitionKind.Update,
    )]: { ...objectFields.input },
    [computeObjectMetadataInputTypeKey(
      apiObjectName,
      GqlInputTypeDefinitionKind.Filter,
    )]: { ...objectFields.input, and: 'and', or: 'or', not: 'not' },
    [computeObjectMetadataInputTypeKey(
      apiObjectName,
      GqlInputTypeDefinitionKind.OrderBy,
    )]: { ...objectFields.input },
    [computeObjectMetadataInputTypeKey(
      apiObjectName,
      GqlInputTypeDefinitionKind.GroupBy,
    )]: objectFields.groupBy,
    [computeObjectMetadataInputTypeKey(
      apiObjectName,
      GqlInputTypeDefinitionKind.OrderByWithGroupBy,
    )]: { aggregate: 'aggregate', ...objectFields.input },
    [`${apiNodeTypeName}${GqlInputTypeDefinitionKind.OrderByWithGroupBy}AggregateInput`]:
      { ...aggregationOrderFields, ...objectFields.relationInput },
    [`${apiNodeTypeName}RelationInput`]: {
      [RELATION_NESTED_QUERY_KEYWORDS.CONNECT]:
        RELATION_NESTED_QUERY_KEYWORDS.CONNECT,
      [RELATION_NESTED_QUERY_KEYWORDS.CREATE]:
        RELATION_NESTED_QUERY_KEYWORDS.CREATE,
      [RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT]:
        RELATION_NESTED_QUERY_KEYWORDS.DISCONNECT,
    },
    [`${apiNodeTypeName}ConnectInput`]: {
      [RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE]:
        RELATION_NESTED_QUERY_KEYWORDS.CONNECT_WHERE,
    },
    [`${apiNodeTypeName}WhereUniqueInput`]: uniqueBindings.uniqueFields,
    ...uniqueBindings.canonicalFieldNameByApiTypeNameAndApiFieldName,
  };

  Object.assign(
    canonicalTypeNameByApiTypeName,
    uniqueBindings.canonicalTypeNameByApiTypeName,
  );

  for (const fieldMetadata of fields) {
    const canonicalFieldTypeNames = getWorkspaceApiFieldTypeNames({
      objectNameSingular: flatObjectMetadata.nameSingular,
      flatFieldMetadata: fieldMetadata,
      name: fieldMetadata.name,
    });
    const apiFieldTypeNames = getWorkspaceApiFieldTypeNames({
      objectNameSingular: apiObjectName,
      flatFieldMetadata: fieldMetadata,
      name:
        view.fields[fieldMetadata.universalIdentifier] ?? fieldMetadata.name,
    });

    for (const [index, apiTypeName] of apiFieldTypeNames.entries()) {
      canonicalTypeNameByApiTypeName[apiTypeName] =
        canonicalFieldTypeNames[index];
    }
  }

  return {
    canonicalTypeNameByApiTypeName,
    canonicalFieldNameByApiTypeNameAndApiFieldName,
  };
};
