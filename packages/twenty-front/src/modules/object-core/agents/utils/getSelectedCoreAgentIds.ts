import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { type CoreAgentsSelection } from '@/object-core/agents/types/CoreAgentsSelection';
import { getIsMetadataItemCustom } from '@/object-metadata/utils/getIsMetadataItemCustom';
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
  if (selection.filterSettings !== filterSettings) {
    return [];
  }

  const selectableAgentIds = new Set(
    coreAgents
      .filter((agent) =>
        getIsMetadataItemCustom(agent, workspaceCustomApplicationId),
      )
      .map(({ id }) => id),
  );

  return [...new Set(selection.rowIds)].filter((id) =>
    selectableAgentIds.has(id),
  );
};
