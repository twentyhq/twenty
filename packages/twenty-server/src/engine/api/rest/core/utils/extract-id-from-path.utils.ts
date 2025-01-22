import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';

export const extractObjectIdFromPath = (path: string) => {
  const pathParts = path.split('/');
  const id = pathParts[pathParts.length - 1];

  assertIsValidUuid(id);

  return id;
};
