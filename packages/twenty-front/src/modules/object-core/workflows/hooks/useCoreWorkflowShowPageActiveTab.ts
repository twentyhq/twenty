import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { useCanReadWorkflowRuns } from '@/object-core/workflows/hooks/useCanReadWorkflowRuns';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { getCoreWorkflowShowPageTabIdFromHash } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabIdFromHash';

const RUN_TAB_IDS: CoreWorkflowShowPageTabId[] = [
  CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW,
  CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS,
];

type UseCoreWorkflowShowPageActiveTabArgs = {
  isPublished: boolean | undefined;
  isVersionRequested: boolean;
};

export const useCoreWorkflowShowPageActiveTab = ({
  isPublished,
  isVersionRequested,
}: UseCoreWorkflowShowPageActiveTabArgs) => {
  const location = useLocation();

  // Settled once loaded so publishing from the Flow tab does not switch to Overview
  const [isPublishedOnLoad, setIsPublishedOnLoad] = useState(isPublished);

  if (!isDefined(isPublishedOnLoad) && isDefined(isPublished)) {
    setIsPublishedOnLoad(isPublished);
  }

  const canReadWorkflowRuns = useCanReadWorkflowRuns();

  // Drafts have no runs yet and a requested version is opened to see its flow
  const defaultTabId =
    isPublishedOnLoad && canReadWorkflowRuns && !isVersionRequested
      ? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW
      : CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW;

  const tabIdFromHash = getCoreWorkflowShowPageTabIdFromHash({
    hash: location.hash,
    defaultTabId,
  });
  const isLinkedToUnreadableRuns =
    RUN_TAB_IDS.includes(tabIdFromHash) && !canReadWorkflowRuns;

  return isLinkedToUnreadableRuns
    ? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW
    : tabIdFromHash;
};
