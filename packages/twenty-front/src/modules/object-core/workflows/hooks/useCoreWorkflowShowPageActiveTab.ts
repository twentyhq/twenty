import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { useCanReadWorkflowRuns } from '@/object-core/workflows/hooks/useCanReadWorkflowRuns';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { getCoreWorkflowShowPageTabListComponentInstanceId } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabListComponentInstanceId';
import { useTabListActiveTabId } from '@/ui/layout/tab-list/hooks/useTabListActiveTabId';

type UseCoreWorkflowShowPageActiveTabArgs = {
  coreWorkflowId: string;
  // undefined until the run insights have loaded
  hasRuns: boolean | undefined;
  requestedVersionId: string | null;
};

export const useCoreWorkflowShowPageActiveTab = ({
  coreWorkflowId,
  hasRuns,
  requestedVersionId,
}: UseCoreWorkflowShowPageActiveTabArgs): CoreWorkflowShowPageTabId => {
  // Settled once loaded so a first run started from the Flow tab does not switch to Overview
  const [hasRunsOnLoad, setHasRunsOnLoad] = useState(hasRuns);

  if (!isDefined(hasRunsOnLoad) && isDefined(hasRuns)) {
    setHasRunsOnLoad(hasRuns);
  }

  const canReadWorkflowRuns = useCanReadWorkflowRuns();

  const visibleTabIds: CoreWorkflowShowPageTabId[] = canReadWorkflowRuns
    ? [
        CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW,
        CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW,
        CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS,
      ]
    : [CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW];

  // Overview has nothing to show without runs and a requested version is opened to see its flow
  const defaultTabId =
    hasRunsOnLoad === true &&
    canReadWorkflowRuns &&
    !isDefined(requestedVersionId)
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
