import { type Request } from 'express';
import { type DocumentNode, type FieldNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

// An ambiguous or unmatched operationName executes nothing, and recording a
// request must never be what makes it fail.
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

// Both /graphql pipelines call this: direct execution ends the response before
// the parsing hooks run, so the parse side alone would miss workspace CRUD.
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
