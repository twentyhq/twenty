import { type Request } from 'express';
import { type DocumentNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

// Both /graphql pipelines call this: direct execution ends the response before
// the parsing hooks run, so the parse side alone would miss workspace CRUD.
export const captureExecutedRootResolvers = ({
  request,
  document,
  operationName,
}: {
  request: Request | undefined;
  document: DocumentNode;
  operationName: string | undefined;
}): void => {
  if (!request || request.executedRootResolvers) {
    return;
  }

  try {
    request.executedRootResolvers = graphQLExtractTopLevelFields(
      document,
      operationName,
    )
      .map((field) => field.name.value)
      .filter((name) => !name.startsWith('__'));
  } catch {
    // An ambiguous or unmatched operationName executes nothing, and recording a
    // request must never be what makes it fail.
    request.executedRootResolvers = [];
  }
};
