import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";
import { capitalize } from "src/logic-functions/utils/capitalize.util";
import { PAGE_SIZE } from "src/constants/page-size";

export type RecordsPage = {
  edges: { node: Record<string, unknown> }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

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
