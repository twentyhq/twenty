import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';

const CORE_WORKFLOW_SHOW_PAGE_TAB_IDS: string[] = Object.values(
  CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS,
);

const isCoreWorkflowShowPageTabId = (
  tabId: string,
): tabId is CoreWorkflowShowPageTabId =>
  CORE_WORKFLOW_SHOW_PAGE_TAB_IDS.includes(tabId);

export const getCoreWorkflowShowPageTabIdFromHash = ({
  hash,
  defaultTabId,
}: {
  hash: string;
  defaultTabId: CoreWorkflowShowPageTabId;
}): CoreWorkflowShowPageTabId => {
  const tabId = hash.replace('#', '');

  return isCoreWorkflowShowPageTabId(tabId) ? tabId : defaultTabId;
};
