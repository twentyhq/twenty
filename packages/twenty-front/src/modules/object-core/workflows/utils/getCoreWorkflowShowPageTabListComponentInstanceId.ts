import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';

export const getCoreWorkflowShowPageTabListComponentInstanceId = (
  coreWorkflowId: string,
) =>
  `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}`;
