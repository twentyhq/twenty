import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';
import { getCoreAgentShowPageTabListComponentInstanceId } from '@/object-core/agents/utils/getCoreAgentShowPageTabListComponentInstanceId';
import { useTabListActiveTabId } from '@/ui/layout/tab-list/hooks/useTabListActiveTabId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCoreAgentShowPageActiveTab = (agentId: string) => {
  const isTurnsTabAvailable = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  return (
    useTabListActiveTabId({
      componentInstanceId:
        getCoreAgentShowPageTabListComponentInstanceId(agentId),
      visibleTabIds: isTurnsTabAvailable
        ? [
            CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS,
            CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS,
          ]
        : [CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS],
      defaultTabId: CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS,
    }) ?? CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS
  );
};
