import { type DocumentNode, type FieldNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

export const extractTopLevelFieldsSafely = (
  document: DocumentNode,
  operationName: string | undefined,
): FieldNode[] => {
  try {
    return graphQLExtractTopLevelFields(document, operationName);
  } catch {
    return [];
  }
};
