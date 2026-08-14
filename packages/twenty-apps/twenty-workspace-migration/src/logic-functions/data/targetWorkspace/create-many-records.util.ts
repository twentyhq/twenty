import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";
import { capitalize } from "src/logic-functions/utils/capitalize.util";
import { toGraphQlLiteral } from "src/logic-functions/utils/to-graphql-literal.util";

export const createManyRecords = async (
  client: AxiosInstance,
  namePlural: string,
  data: Record<string, unknown>[],
  enumDataKeys: ReadonlySet<string>,
): Promise<{ id: string }[]> => {
  const operationName = `create${capitalize(namePlural)}`;
  const mutation = `mutation ${operationName} {
  ${operationName}(data: ${toGraphQlLiteral(data, enumDataKeys)}) {
    id
  }
}`;

  const responseData = await postGraphql<Record<string, { id: string }[]>>(
    client,
    '/graphql',
    operationName,
    mutation,
  );

  return responseData[operationName];
}
