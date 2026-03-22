import { type DocumentNode } from 'graphql';

import { graphQLExtractTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/graphql-extract-top-level-fields.util';

export const hasOnlyGeneratedWorkspaceResolvers = (
  document: DocumentNode,
  operationName: string | undefined,
  generatedWorkspaceResolverNames: Set<string>,
): boolean => {
  const topLevelFields = graphQLExtractTopLevelFields(document, operationName);

  return topLevelFields.every((field) =>
    generatedWorkspaceResolverNames.has(field.name.value),
  );
};
