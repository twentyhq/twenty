import { type DocumentNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

const INTROSPECTION_FIELD_NAMES = new Set(['__schema', '__type']);

type TopLevelFieldsClassification = {
  hasIntrospectionFields: boolean;
  hasWorkspaceFields: boolean;
  hasCoreFields: boolean;
};

export const classifyTopLevelFields = (
  document: DocumentNode,
  operationName: string | undefined,
  workspaceResolverNames: Set<string>,
): TopLevelFieldsClassification => {
  const topLevelFields = graphQLExtractTopLevelFields(document, operationName);

  let hasIntrospectionFields = false;
  let hasWorkspaceFields = false;
  let hasCoreFields = false;

  for (const field of topLevelFields) {
    if (INTROSPECTION_FIELD_NAMES.has(field.name.value)) {
      hasIntrospectionFields = true;
    } else if (workspaceResolverNames.has(field.name.value)) {
      hasWorkspaceFields = true;
    } else {
      hasCoreFields = true;
    }
  }

  return { hasIntrospectionFields, hasWorkspaceFields, hasCoreFields };
};
