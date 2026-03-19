import { type DocumentNode } from 'graphql';

import { parseTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/parse-top-level-fields.util';

export const hasOnlyGeneratedWorkspaceResolvers = (
  document: DocumentNode,
  operationName: string | undefined,
  generatedWorkspaceResolverNames: Set<string>,
): boolean => {
  const topLevelFields = parseTopLevelFields(document, operationName);

  return topLevelFields.every((field) =>
    generatedWorkspaceResolverNames.has(field.name.value),
  );
};
