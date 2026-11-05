import {
  type DocumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLResolveInfo,
  type GraphQLSchema,
  isInputType,
  isObjectType,
  Kind,
  typeFromAST,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { normalizeWorkspaceApiGraphqlDocument } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-graphql-document.util';
import { normalizeWorkspaceApiInputValue } from 'src/engine/api/common/workspace-api-naming/utils/normalize-workspace-api-input-value.util';
import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';

const RESOLVE_INFO_FIELD_NODES_FRAGMENT_PREFIX =
  'WorkspaceApiResolveInfoFields';

export const normalizeWorkspaceApiGraphqlResolveInfo = ({
  info,
  canonicalSchema,
  canonicalFieldName,
  canonicalTypeNameByApiTypeName,
  canonicalFieldNameByApiTypeNameAndApiFieldName,
}: {
  info: GraphQLResolveInfo;
  canonicalSchema: GraphQLSchema;
  canonicalFieldName: string;
  canonicalTypeNameByApiTypeName: Readonly<Record<string, string>>;
  canonicalFieldNameByApiTypeNameAndApiFieldName: Readonly<
    Record<string, Readonly<Record<string, string>>>
  >;
}): GraphQLResolveInfo => {
  const canonicalTypeNameMap = new Map(
    Object.entries(canonicalTypeNameByApiTypeName),
  );
  const canonicalParentTypeName =
    canonicalTypeNameMap.get(info.parentType.name) ?? info.parentType.name;
  const canonicalParentType = canonicalSchema.getType(canonicalParentTypeName);

  if (!isObjectType(canonicalParentType)) {
    throw new WorkspaceApiNamingException(
      `Canonical parent type "${canonicalParentTypeName}" is not an object type`,
    );
  }

  const canonicalField = canonicalParentType.getFields()[canonicalFieldName];

  if (!isDefined(canonicalField)) {
    throw new WorkspaceApiNamingException(
      `Canonical field "${canonicalParentTypeName}.${canonicalFieldName}" does not exist`,
    );
  }

  const fragments = Object.values(info.fragments);
  const fragmentNames = new Set(
    fragments.map((fragment) => fragment.name.value),
  );
  let fieldNodesFragmentName = RESOLVE_INFO_FIELD_NODES_FRAGMENT_PREFIX;
  let fieldNodesFragmentSuffix = 0;

  while (fragmentNames.has(fieldNodesFragmentName)) {
    fieldNodesFragmentSuffix += 1;
    fieldNodesFragmentName = `${RESOLVE_INFO_FIELD_NODES_FRAGMENT_PREFIX}${fieldNodesFragmentSuffix}`;
  }

  const document: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      info.operation,
      ...fragments,
      {
        kind: Kind.FRAGMENT_DEFINITION,
        name: { kind: Kind.NAME, value: fieldNodesFragmentName },
        typeCondition: {
          kind: Kind.NAMED_TYPE,
          name: { kind: Kind.NAME, value: info.parentType.name },
        },
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: info.fieldNodes,
        },
      },
    ],
  };
  const normalizedDocument = normalizeWorkspaceApiGraphqlDocument({
    document,
    schema: info.schema,
    canonicalTypeNameByApiTypeName,
    canonicalFieldNameByApiTypeNameAndApiFieldName,
  });
  const normalizedOperation = normalizedDocument.definitions[0];
  const normalizedFieldNodesFragment =
    normalizedDocument.definitions[normalizedDocument.definitions.length - 1];

  if (
    normalizedOperation.kind !== Kind.OPERATION_DEFINITION ||
    normalizedFieldNodesFragment.kind !== Kind.FRAGMENT_DEFINITION
  ) {
    throw new WorkspaceApiNamingException(
      'Normalized resolver document has invalid definitions',
    );
  }

  const variableValues = { ...info.variableValues };

  for (const variableDefinition of info.operation.variableDefinitions ?? []) {
    const variableName = variableDefinition.variable.name.value;

    if (!Object.prototype.hasOwnProperty.call(variableValues, variableName)) {
      continue;
    }

    const inputType = typeFromAST(info.schema, variableDefinition.type);

    if (!isInputType(inputType)) {
      throw new WorkspaceApiNamingException(
        `API variable "$${variableName}" does not have an input type`,
      );
    }

    variableValues[variableName] = normalizeWorkspaceApiInputValue({
      value: variableValues[variableName],
      type: inputType,
      canonicalFieldNameByApiTypeNameAndApiFieldName,
    });
  }

  return {
    ...info,
    fieldName: canonicalFieldName,
    fieldNodes: normalizedFieldNodesFragment.selectionSet.selections.filter(
      (selection): selection is FieldNode => selection.kind === Kind.FIELD,
    ),
    returnType: canonicalField.type,
    parentType: canonicalParentType,
    schema: canonicalSchema,
    fragments: Object.fromEntries(
      normalizedDocument.definitions
        .slice(1, -1)
        .filter(
          (definition): definition is FragmentDefinitionNode =>
            definition.kind === Kind.FRAGMENT_DEFINITION,
        )
        .map((fragment) => [fragment.name.value, fragment]),
    ),
    operation: normalizedOperation,
    variableValues,
  };
};
