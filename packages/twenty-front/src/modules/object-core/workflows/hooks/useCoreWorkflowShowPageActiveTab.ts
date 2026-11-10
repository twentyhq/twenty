import { useLocation } from 'react-router-dom';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { canReachSomeRecords } from 'twenty-shared/utils';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { getCoreWorkflowShowPageTabIdFromHash } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabIdFromHash';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';

export const useCoreWorkflowShowPageActiveTab = (coreWorkflowId: string) => {
  const location = useLocation();

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

  const tabIdFromHash = getCoreWorkflowShowPageTabIdFromHash(location.hash);
  const isLinkedToUnreadableRuns =
    tabIdFromHash === CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS &&
    !canReadWorkflowRuns;

  return {
    activeTabId: isLinkedToUnreadableRuns
      ? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW
      : tabIdFromHash,
    canReadWorkflowRuns,
    tabListComponentInstanceId: `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}`,
  };
};
