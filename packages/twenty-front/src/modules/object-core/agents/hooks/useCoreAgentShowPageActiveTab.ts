import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';
import { useCanReadCoreAgentRuns } from '@/object-core/agents/hooks/useCanReadCoreAgentRuns';
import { type CoreAgentShowPageTabId } from '@/object-core/agents/types/CoreAgentShowPageTabId';
import { getCoreAgentShowPageTabs } from '@/object-core/agents/utils/getCoreAgentShowPageTabs';
import { getCoreAgentShowPageTabListComponentInstanceId } from '@/object-core/agents/utils/getCoreAgentShowPageTabListComponentInstanceId';
import { useTabListActiveTabId } from '@/ui/layout/tab-list/hooks/useTabListActiveTabId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type UseCoreAgentShowPageActiveTabArgs = {
  agentId: string;
  // undefined until the run insights have loaded
  hasRuns: boolean | undefined;
};

export const useCoreAgentShowPageActiveTab = ({
  agentId,
  hasRuns,
}: UseCoreAgentShowPageActiveTabArgs): CoreAgentShowPageTabId => {
  // Settled once loaded so a first run started while editing does not switch to Overview
  const [hasRunsOnLoad, setHasRunsOnLoad] = useState(hasRuns);

  if (!isDefined(hasRunsOnLoad) && isDefined(hasRuns)) {
    setHasRunsOnLoad(hasRuns);
  }

  const isTurnsTabAvailable = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canReadCoreAgentRuns = useCanReadCoreAgentRuns();

  const { visibleTabIds, defaultTabId } = getCoreAgentShowPageTabs({
    canReadCoreAgentRuns,
    isTurnsTabAvailable,
    hasRuns: hasRunsOnLoad,
  });

  return (
    useTabListActiveTabId({
      componentInstanceId:
        getCoreAgentShowPageTabListComponentInstanceId(agentId),
      visibleTabIds,
      defaultTabId,
    }) ?? CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.SETTINGS
  );
};
