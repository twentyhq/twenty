import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';

export const buildColumnsToReturn = (
  args: Parameters<typeof buildColumnsToSelect>[0],
): string[] => Object.keys(buildColumnsToSelect(args));
