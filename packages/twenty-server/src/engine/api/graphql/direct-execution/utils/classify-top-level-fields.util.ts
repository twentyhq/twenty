import { type FieldNode } from 'graphql';

const INTROSPECTION_FIELD_NAMES = new Set(['__schema', '__type']);

type TopLevelFieldsClassification = {
  hasIntrospectionFields: boolean;
  hasWorkspaceFields: boolean;
  hasCoreFields: boolean;
};

export const classifyTopLevelFields = (
  topLevelFields: FieldNode[],
  workspaceResolverNames: Set<string>,
): TopLevelFieldsClassification => {
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
