import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { canReachSomeRecords } from 'twenty-shared/utils';
import {
  IconSettingsAutomation,
  IconTerminal,
  IconVersions,
} from 'twenty-ui/icon';

import { CoreWorkflowRunsTab } from '@/object-core/workflows/components/CoreWorkflowRunsTab';
import { CoreWorkflowVersionsTab } from '@/object-core/workflows/components/CoreWorkflowVersionsTab';
import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { getCoreWorkflowShowPageTabIdFromHash } from '@/object-core/workflows/utils/getCoreWorkflowShowPageTabIdFromHash';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type GetCoreWorkflowVersionsQuery } from '~/generated/graphql';

const StyledTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

type CoreWorkflowShowPageTabsProps = {
  coreWorkflowId: string;
  coreWorkflowVersions: GetCoreWorkflowVersionsQuery['coreWorkflowVersions'];
  flowTab: ReactNode;
};

type CoreWorkflowShowPageActiveTabProps = CoreWorkflowShowPageTabsProps & {
  activeTabId: CoreWorkflowShowPageTabId;
};

const CoreWorkflowShowPageActiveTab = ({
  activeTabId,
  coreWorkflowId,
  coreWorkflowVersions,
  flowTab,
}: CoreWorkflowShowPageActiveTabProps) => {
  const versionLabelById = useMemo(
    () => new Map(coreWorkflowVersions.map(({ id, label }) => [id, label])),
    [coreWorkflowVersions],
  );

  if (activeTabId === CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS) {
    return (
      <StyledTabContent>
        <CoreWorkflowRunsTab
          coreWorkflowId={coreWorkflowId}
          versionLabelById={versionLabelById}
        />
      </StyledTabContent>
    );
  }

  if (activeTabId === CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.VERSIONS) {
    return (
      <StyledTabContent>
        <CoreWorkflowVersionsTab coreWorkflowVersions={coreWorkflowVersions} />
      </StyledTabContent>
    );
  }

  return flowTab;
};

export const CoreWorkflowShowPageTabs = ({
  coreWorkflowId,
  coreWorkflowVersions,
  flowTab,
}: CoreWorkflowShowPageTabsProps) => {
  const { t } = useLingui();
  const location = useLocation();

  // TabList keeps its last tab when the URL has no hash, so a hash-less visit gets a fresh instance that opens Flow
  const tabListInstanceSuffix = isNonEmptyString(location.hash)
    ? 'linked-tab'
    : location.key;
  const tabListComponentInstanceId = `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}-${tabListInstanceSuffix}`;

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
  const activeTabId =
    tabIdFromHash === CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS &&
    !canReadWorkflowRuns
      ? CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW
      : tabIdFromHash;

  return (
    <>
      <TabList
        aria-label={t`Workflow sections`}
        componentInstanceId={tabListComponentInstanceId}
        tabs={[
          {
            id: CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.FLOW,
            title: t`Flow`,
            Icon: IconSettingsAutomation,
          },
          {
            id: CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.RUNS,
            title: t`Runs`,
            Icon: IconTerminal,
            hide: !canReadWorkflowRuns,
          },
          {
            id: CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.VERSIONS,
            title: t`Versions`,
            Icon: IconVersions,
          },
        ]}
      />
      <CoreWorkflowShowPageActiveTab
        activeTabId={activeTabId}
        coreWorkflowId={coreWorkflowId}
        coreWorkflowVersions={coreWorkflowVersions}
        flowTab={flowTab}
      />
    </>
  );
};
