import { useLingui } from '@lingui/react/macro';
import {
  IconLayoutDashboard,
  IconSettingsAutomation,
  IconTerminal,
  IconVersions,
} from 'twenty-ui/icon';

import { CoreObjectShowPageTabList } from '@/object-core/components/CoreObjectShowPageTabList';
import { CORE_WORKFLOW_SHOW_PAGE_TABS } from '@/object-core/workflows/constants/CoreWorkflowShowPageTabs';
import { type CoreWorkflowShowPageTabId } from '@/object-core/workflows/types/CoreWorkflowShowPageTabId';

type CoreWorkflowShowPageTabListProps = {
  activeTabId: CoreWorkflowShowPageTabId;
  canReadWorkflowRuns: boolean;
  componentInstanceId: string;
};

export const CoreWorkflowShowPageTabList = ({
  activeTabId,
  canReadWorkflowRuns,
  componentInstanceId,
}: CoreWorkflowShowPageTabListProps) => {
  const { t } = useLingui();

  return (
    <CoreObjectShowPageTabList
      aria-label={t`Workflow sections`}
      activeTabId={activeTabId}
      componentInstanceId={componentInstanceId}
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
        {
          id: CORE_WORKFLOW_SHOW_PAGE_TABS.TAB_IDS.VERSIONS,
          title: t`Versions`,
          Icon: IconVersions,
        },
      ]}
    />
  );
};
