import { type Request } from 'express';
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

export const captureExecutedRootResolvers = ({
  request,
  topLevelFields,
}: {
  request: Request | undefined;
  topLevelFields: FieldNode[];
}): void => {
  if (!request || request.executedRootResolvers) {
    return;
  }

  request.executedRootResolvers = topLevelFields
    .map((field) => field.name.value)
    .filter((name) => !name.startsWith('__'));
};
