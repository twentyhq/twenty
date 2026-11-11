import { useLingui } from '@lingui/react/macro';
import {
  IconLayoutDashboard,
  IconSettingsAutomation,
  IconTerminal,
} from 'twenty-ui/icon';

import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { useCanReadWorkflowRuns } from '@/object-core/workflows/hooks/useCanReadWorkflowRuns';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListSelectionSyncEffect } from '@/ui/layout/tab-list/components/TabListSelectionSyncEffect';

type CoreWorkflowShowPageTabListProps = {
  activeTabId: CoreWorkflowShowPageTabId;
  componentInstanceId: string;
};

export const CoreWorkflowShowPageTabList = ({
  activeTabId,
  componentInstanceId,
}: CoreWorkflowShowPageTabListProps) => {
  const { t } = useLingui();
  const canReadWorkflowRuns = useCanReadWorkflowRuns();

  return (
    <>
      <TabList
        aria-label={t`Workflow sections`}
        componentInstanceId={componentInstanceId}
        defaultActiveTabId={activeTabId}
        centerTabs
        tabs={[
          {
            id: CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW,
            title: t`Overview`,
            Icon: IconLayoutDashboard,
            hide: !canReadWorkflowRuns,
          },
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
        ]}
      />
      {/* Rendered after TabList so its stored or first-tab fallback never wins over the tab being shown */}
      <TabListSelectionSyncEffect
        componentInstanceId={componentInstanceId}
        nextActiveTabId={activeTabId}
      />
    </>
  );
};
