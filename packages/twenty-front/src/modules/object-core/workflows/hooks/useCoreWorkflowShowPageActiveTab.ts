import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { useCanReadWorkflowRuns } from '@/object-core/workflows/hooks/useCanReadWorkflowRuns';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { getCoreWorkflowShowPageTabListComponentInstanceId } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabListComponentInstanceId';
import { useTabListActiveTabId } from '@/ui/layout/tab-list/hooks/useTabListActiveTabId';

type UseCoreWorkflowShowPageActiveTabArgs = {
  coreWorkflowId: string;
  isPublished: boolean | undefined;
  requestedVersionId: string | null;
};

export const useCoreWorkflowShowPageActiveTab = ({
  coreWorkflowId,
  isPublished,
  requestedVersionId,
}: UseCoreWorkflowShowPageActiveTabArgs): CoreWorkflowShowPageTabId => {
  // Settled once loaded so publishing from the Flow tab does not switch to Overview
  const [isPublishedOnLoad, setIsPublishedOnLoad] = useState(isPublished);

  if (!isDefined(isPublishedOnLoad) && isDefined(isPublished)) {
    setIsPublishedOnLoad(isPublished);
  }

  const canReadWorkflowRuns = useCanReadWorkflowRuns();

  const visibleTabIds: CoreWorkflowShowPageTabId[] = canReadWorkflowRuns
    ? [
        CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW,
        CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW,
        CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS,
      ]
    : [CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW];

  // Drafts have no runs yet and a requested version is opened to see its flow
  const defaultTabId =
    isPublishedOnLoad && canReadWorkflowRuns && !isDefined(requestedVersionId)
      ? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW
      : CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW;

  return (
    useTabListActiveTabId({
      componentInstanceId: getCoreWorkflowShowPageTabListComponentInstanceId({
        coreWorkflowId,
        requestedVersionId,
      }),
      visibleTabIds,
      defaultTabId,
    }) ?? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW
  );
};
