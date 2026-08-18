import { type DocumentNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

const INTROSPECTION_FIELD_NAMES = new Set(['__schema', '__type']);

type TopLevelFieldsClassification = {
  hasIntrospectionFields: boolean;
  hasWorkspaceFields: boolean;
  hasCoreFields: boolean;
  unknownFieldNames: string[];
};

export const classifyTopLevelFields = (
  document: DocumentNode,
  operationName: string | undefined,
  workspaceResolverNames: Set<string>,
  coreRootFieldNames: Set<string> = new Set(),
): TopLevelFieldsClassification => {
  const topLevelFields = graphQLExtractTopLevelFields(document, operationName);

  // An empty set means the core schema has not been captured yet, in which case
  // anything that is not a workspace field is assumed to be a core field.
  const isCoreSchemaKnown = coreRootFieldNames.size > 0;

  let hasIntrospectionFields = false;
  let hasWorkspaceFields = false;
  let hasCoreFields = false;
  const unknownFieldNames: string[] = [];

  for (const field of topLevelFields) {
    const fieldName = field.name.value;

    if (INTROSPECTION_FIELD_NAMES.has(fieldName)) {
      hasIntrospectionFields = true;
    } else if (workspaceResolverNames.has(fieldName)) {
      hasWorkspaceFields = true;
    } else if (!isCoreSchemaKnown || coreRootFieldNames.has(fieldName)) {
      hasCoreFields = true;
    } else {
      unknownFieldNames.push(fieldName);
    }
  }

  return {
    hasIntrospectionFields,
    hasWorkspaceFields,
    hasCoreFields,
    unknownFieldNames,
  };
};
