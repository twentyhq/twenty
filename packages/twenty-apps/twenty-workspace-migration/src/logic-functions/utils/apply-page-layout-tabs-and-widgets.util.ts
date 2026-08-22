import type { AxiosInstance } from "axios";
import type { PageLayoutTab } from "src/logic-functions/types/dashboard.type";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import {
  updatePageLayoutWithTabsAndWidgets
} from "src/logic-functions/requests/update-page-layout-with-tabs-and-widgets.util";
import { buildPageLayoutTabsInput } from "src/logic-functions/utils/build-page-layout-tabs-input.util";

export const applyPageLayoutTabsAndWidgets = async (
  targetWorkspace: AxiosInstance,
  targetPageLayoutId: string,
  sourceTabs: PageLayoutTab[],
  targetObjectIdBySourceObjectId: Map<string, string>,
  targetFieldIdBySourceFieldId: Map<string, string>,
  warningContext: string,
): Promise<void> => {
  const tabs = buildPageLayoutTabsInput(sourceTabs, targetObjectIdBySourceObjectId, targetFieldIdBySourceFieldId, warningContext);
  await executeWithRetryAndCheckpoint(() => updatePageLayoutWithTabsAndWidgets(targetWorkspace, targetPageLayoutId, tabs));
};