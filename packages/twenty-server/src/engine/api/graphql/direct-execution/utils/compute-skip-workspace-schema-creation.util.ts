import { type DocumentNode } from 'graphql';

import { parseTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/parse-top-level-fields.util';

const INTROSPECTION_PATTERN = /__schema|__type(?!name)/;

export const computeSkipWorkspaceSchemaCreation = (
  queryString: string,
  document: DocumentNode,
  operationName: string | undefined,
  generatedWorkspaceResolverNames: Set<string>,
): boolean => {
  if (INTROSPECTION_PATTERN.test(queryString)) {
    return false;
  }

  const topLevelFields = parseTopLevelFields(document, operationName);

  const hasCore = topLevelFields.some(
    (field) => !generatedWorkspaceResolverNames.has(field.name.value),
  );
  const hasGenerated = topLevelFields.some((field) =>
    generatedWorkspaceResolverNames.has(field.name.value),
  );

  return !(hasCore && hasGenerated);
};
