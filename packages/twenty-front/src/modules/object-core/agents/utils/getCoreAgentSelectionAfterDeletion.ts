import { type CoreAgentsSelection } from '@/object-core/agents/types/CoreAgentsSelection';

export const getCoreAgentSelectionAfterDeletion = ({
  selection,
  deletedAgentIds,
}: {
  selection: CoreAgentsSelection;
  deletedAgentIds: string[];
}): CoreAgentsSelection => {
  const deletedAgentIdSet = new Set(deletedAgentIds);

  return {
    ...selection,
    rowIds: selection.rowIds.filter((id) => !deletedAgentIdSet.has(id)),
  };
};
