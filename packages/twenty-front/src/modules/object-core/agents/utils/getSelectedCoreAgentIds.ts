import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentsSelection } from '@/object-core/agents/types/CoreAgentsSelection';
import { areCoreAgentFilterSettingsEquivalent } from '@/object-core/agents/utils/areCoreAgentFilterSettingsEquivalent';
import { getCustomCoreAgentIds } from '@/object-core/agents/utils/getCustomCoreAgentIds';
import { type FilterSettings } from '@/workflow/workflow-steps/filters/types/FilterSettings';

export const getSelectedCoreAgentIds = ({
  selection,
  filterSettings,
  coreAgents,
  workspaceCustomApplicationId,
}: {
  selection: CoreAgentsSelection;
  filterSettings: FilterSettings;
  coreAgents: Pick<CoreAgent, 'id' | 'applicationId'>[];
  workspaceCustomApplicationId?: string;
}): string[] => {
  if (
    !areCoreAgentFilterSettingsEquivalent({
      filterSettings: selection.filterSettings,
      otherFilterSettings: filterSettings,
    })
  ) {
    return [];
  }

  return getCustomCoreAgentIds({
    agentIds: selection.rowIds,
    coreAgents,
    workspaceCustomApplicationId,
  });
};
