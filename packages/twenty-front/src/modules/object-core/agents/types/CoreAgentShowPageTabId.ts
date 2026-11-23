import { type CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';

export type CoreAgentShowPageTabId =
  (typeof CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS)[keyof typeof CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS];
