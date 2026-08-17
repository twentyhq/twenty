import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

// Unlike createPageLayoutTab/createPageLayoutWidget (which reject several real widget types -
// FIELDS, TIMELINE, TASKS, NOTES, FILES, EMAILS, CALENDAR, and more - with a blanket "not
// supported yet" error), this bulk mutation goes through a different service that only
// validates configuration shape/field-reference correctness, not the widget type itself. Tabs
// and widgets each carry a client-supplied `id` that doesn't need to already exist - anything
// not found among the layout's current tabs/widgets is created fresh - so this can populate an
// empty, just-created PageLayout from scratch in one call.
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
