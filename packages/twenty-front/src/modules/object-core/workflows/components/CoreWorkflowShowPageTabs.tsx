import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IconSettingsAutomation,
  IconTerminal,
  IconVersions,
} from 'twenty-ui/icon';

import { CoreWorkflowRunsTab } from '@/object-core/workflows/components/CoreWorkflowRunsTab';
import { CoreWorkflowVersionsTab } from '@/object-core/workflows/components/CoreWorkflowVersionsTab';
import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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
  activeTabId: string | null;
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

  // Keyed on the location so a navigation without a tab hash opens Flow instead of the last tab
  const tabListComponentInstanceId = `${CORE_WORKFLOW_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${coreWorkflowId}-${location.key}`;

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    tabListComponentInstanceId,
  );

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
