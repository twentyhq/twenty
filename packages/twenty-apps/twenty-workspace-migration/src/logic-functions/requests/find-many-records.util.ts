import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";
import { capitalize } from "src/logic-functions/utils/capitalize.util";
import { PAGE_SIZE } from "src/constants/page-size";

export type RecordsPage<TNode extends object = Record<string, unknown>> = {
  edges: { node: TNode & { id: string } }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

export const findManyRecords = async <TNode extends object = Record<string, unknown>>(
  client: AxiosInstance,
  namePlural: string,
  selectionSet: string,
  after: string | null,
  pageSize?: number,
): Promise<RecordsPage<TNode>> => {
  const afterArg = after !== null ? `, after: ${JSON.stringify(after)}` : '';
  const operationName = `findMany${capitalize(namePlural)}`;
  const query = `query ${operationName} {
  ${namePlural}(first: ${pageSize ?? PAGE_SIZE}${afterArg}) {
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

  const data = await postGraphql<Record<string, RecordsPage<TNode>>>(
    client,
    '/graphql',
    operationName,
    query,
  );

  return data[namePlural];
}
