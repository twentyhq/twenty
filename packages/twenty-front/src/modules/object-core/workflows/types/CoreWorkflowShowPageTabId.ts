import { type CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';

export type CoreWorkflowShowPageTabId =
  (typeof CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS)[keyof typeof CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS];
