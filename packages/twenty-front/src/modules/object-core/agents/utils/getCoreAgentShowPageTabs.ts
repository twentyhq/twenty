import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';
import { type CoreAgentShowPageTabId } from '@/object-core/agents/types/CoreAgentShowPageTabId';

export const getCoreAgentShowPageTabs = ({
  canReadCoreAgentRuns,
  isTurnsTabAvailable,
  hasRuns,
}: {
  canReadCoreAgentRuns: boolean;
  isTurnsTabAvailable: boolean;
  hasRuns: boolean | undefined;
}): {
  visibleTabIds: CoreAgentShowPageTabId[];
  defaultTabId: CoreAgentShowPageTabId;
} => ({
  visibleTabIds: [
    ...(canReadCoreAgentRuns
      ? [CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW]
      : []),
    CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS,
    ...(isTurnsTabAvailable ? [CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS] : []),
  ],
  defaultTabId:
    hasRuns && canReadCoreAgentRuns
      ? CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.OVERVIEW
      : CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS,
});
