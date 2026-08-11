import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { capitalize } from "src/logic-functions/utils/capitalize.util";
import { toGraphQlLiteral } from "src/logic-functions/utils/to-graphql-literal.util";

// The per-object create input type name (e.g. PersonCreateInput) isn't known ahead of time,
// so `data` is inlined as a GraphQL literal directly in the mutation body instead of a $variable.
export const createOneRecord = async (
  client: AxiosInstance,
  nameSingular: string,
  data: Record<string, unknown>,
  enumDataKeys: ReadonlySet<string>,
): Promise<{ id: string }> => {
  const operationName = `create${capitalize(nameSingular)}`;
  const mutation = `mutation ${operationName} {
  ${operationName}(data: ${toGraphQlLiteral(data, enumDataKeys)}) {
    id
  }
}`;

  const responseData = await postGraphql<Record<string, { id: string }>>(
    client,
    '/graphql',
    operationName,
    mutation,
  );

  return responseData[operationName];
}
