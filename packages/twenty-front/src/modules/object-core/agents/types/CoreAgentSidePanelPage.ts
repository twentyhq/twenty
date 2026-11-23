import { type SidePanelPages } from 'twenty-shared/types';

export type CoreAgentSidePanelPage =
  | SidePanelPages.AgentCoreTriggerType
  | SidePanelPages.AgentCoreTrigger
  | SidePanelPages.AgentCoreDataAccess
  | SidePanelPages.AgentCoreTools;
