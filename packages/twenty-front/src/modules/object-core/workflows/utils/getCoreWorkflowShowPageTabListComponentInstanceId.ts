import { isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';

// A requested version gets its own selection so it opens on its default tab
export const getCoreWorkflowShowPageTabListComponentInstanceId = ({
  coreWorkflowId,
  requestedVersionId,
}: {
  coreWorkflowId: string;
  requestedVersionId: string | null;
}) =>
  isDefined(requestedVersionId)
    ? `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}-version-${requestedVersionId}`
    : `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}`;
