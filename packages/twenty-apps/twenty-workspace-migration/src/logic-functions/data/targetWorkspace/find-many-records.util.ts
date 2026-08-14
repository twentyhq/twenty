import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { capitalize } from "src/logic-functions/utils/capitalize.util";

export type RecordsPage = {
  edges: { node: Record<string, unknown> }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const PAGE_SIZE = 200;

// Generic paginated record reader, used against both source and target workspaces.
// `after` is inlined as a string literal rather than a $variable so callers don't need to
// know the schema's cursor scalar name (ConnectionCursor).
export const findManyRecords = async (
  client: AxiosInstance,
  namePlural: string,
  selectionSet: string,
  after: string | null,
): Promise<RecordsPage> => {
  const afterArg = after !== null ? `, after: ${JSON.stringify(after)}` : '';
  const operationName = `findMany${capitalize(namePlural)}`;
  const query = `query ${operationName} {
  ${namePlural}(first: ${PAGE_SIZE}${afterArg}) {
    edges {
      node {
        id
${selectionSet}
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

  const data = await postGraphql<Record<string, RecordsPage>>(
    client,
    '/graphql',
    operationName,
    query,
  );

  return data[namePlural];
}
