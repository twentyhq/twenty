import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { getCoreWorkflowShowPageTabIdFromHash } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabIdFromHash';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';

const RUN_TAB_IDS: CoreWorkflowShowPageTabId[] = [
  CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW,
  CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS,
];

type UseCoreWorkflowShowPageActiveTabArgs = {
  coreWorkflowId: string;
  isPublished: boolean | undefined;
  isVersionRequested: boolean;
};

export const useCoreWorkflowShowPageActiveTab = ({
  coreWorkflowId,
  isPublished,
  isVersionRequested,
}: UseCoreWorkflowShowPageActiveTabArgs) => {
  const location = useLocation();

  // Settled once loaded so publishing from the Flow tab does not switch to Overview
  const [isPublishedOnLoad, setIsPublishedOnLoad] = useState(isPublished);

  if (!isDefined(isPublishedOnLoad) && isDefined(isPublished)) {
    setIsPublishedOnLoad(isPublished);
  }

  const { objectMetadataItem: workflowRunObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkflowRun,
    });
  const workflowRunPermissions = useObjectPermissionsForObject(
    workflowRunObjectMetadataItem.id,
  );
  const canReadWorkflowRuns = canReachSomeRecords({
    objectRecordsPermissions: workflowRunPermissions,
    operationType: 'read',
  });

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

  return {
    activeTabId: isLinkedToUnreadableRuns
      ? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW
      : tabIdFromHash,
    canReadWorkflowRuns,
    tabListComponentInstanceId: `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}`,
  };
};
