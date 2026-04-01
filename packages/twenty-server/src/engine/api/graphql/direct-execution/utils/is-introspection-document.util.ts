import { type DocumentNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

const INTROSPECTION_FIELD_NAMES = new Set(['__schema', '__type']);

export const isIntrospectionDocument = (
  document: DocumentNode,
  operationName: string | undefined,
): boolean => {
  const topLevelFields = graphQLExtractTopLevelFields(document, operationName);

  if (topLevelFields.length === 0) {
    return false;
  }

  return topLevelFields.every((field) =>
    INTROSPECTION_FIELD_NAMES.has(field.name.value),
  );
};
