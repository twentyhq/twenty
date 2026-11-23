import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';

export const getCoreAgentShowPageTabListComponentInstanceId = (
  agentId: string,
) => `${CORE_AGENT_SHOW_PAGE_TABS.COMPONENT_INSTANCE_ID_PREFIX}-${agentId}`;
