import { styled } from '@linaria/react';
import { type ReactNode, useMemo } from 'react';

import { CoreWorkflowOverviewTab } from '@/object-core/workflows/components/CoreWorkflowOverviewTab';
import { CoreWorkflowRunsTab } from '@/object-core/workflows/components/CoreWorkflowRunsTab';
import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { type GetCoreWorkflowVersionsQuery } from '~/generated/graphql';

const StyledTabContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

type CoreWorkflowShowPageActiveTabProps = {
  activeTabId: CoreWorkflowShowPageTabId;
  coreWorkflowId: string;
  coreWorkflowVersions: GetCoreWorkflowVersionsQuery['coreWorkflowVersions'];
  flowTab: ReactNode;
};

export const CoreWorkflowShowPageActiveTab = ({
  activeTabId,
  coreWorkflowId,
  coreWorkflowVersions,
  flowTab,
}: CoreWorkflowShowPageActiveTabProps) => {
  const versionLabelById = useMemo(
    () => new Map(coreWorkflowVersions.map(({ id, label }) => [id, label])),
    [coreWorkflowVersions],
  );

  if (activeTabId === CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW) {
    return (
      <StyledTabContent>
        <CoreWorkflowOverviewTab coreWorkflowId={coreWorkflowId} />
      </StyledTabContent>
    );
  }

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

  return flowTab;
};
