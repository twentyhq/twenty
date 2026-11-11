import { useLocation } from 'react-router-dom';

import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCoreAgentShowPageActiveTab = () => {
  const location = useLocation();
  const isTurnsTabAvailable = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  const isTurnsTabRequested =
    location.hash === `#${CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS}`;

  return isTurnsTabAvailable && isTurnsTabRequested
    ? CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS
    : CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS;
};
