import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/requests/graphql-client.util";

export const updatePageLayoutWithTabsAndWidgets = async (
  client: AxiosInstance,
  pageLayoutId: string,
  tabs: Record<string, unknown>[],
): Promise<void> => {
  const mutation = `mutation UpdatePageLayoutWithTabsAndWidgets($id: String!, $input: UpdatePageLayoutWithTabsInput!) {
  updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
    id
  }
}`;

  await postGraphql(client, '/metadata', 'UpdatePageLayoutWithTabsAndWidgets', mutation, {
    id: pageLayoutId,
    input: { tabs },
  });
}
