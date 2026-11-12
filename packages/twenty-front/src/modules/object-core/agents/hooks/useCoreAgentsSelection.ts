import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { coreAgentsSelectionState } from '@/object-core/agents/states/coreAgentsSelectionState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getSelectedCoreAgentRowIds } from '@/object-core/agents/utils/getSelectedCoreAgentRowIds';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreAgentsSelection = ({
  coreAgents,
}: {
  coreAgents: Pick<CoreAgent, 'id'>[];
}) => {
  const [coreAgentsSelection, setCoreAgentsSelection] = useAtomState(
    coreAgentsSelectionState,
  );

  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  const selectionRowIds = getSelectedCoreAgentRowIds({
    selection: coreAgentsSelection,
    currentFilterSettings: coreAgentsFilterSettings,
  });
  const listedCoreAgentIds = new Set(coreAgents.map(({ id }) => id));
  const selectedRowIds = selectionRowIds.filter((id) =>
    listedCoreAgentIds.has(id),
  );

  const selectRows = (rowIds: string[]) =>
    setCoreAgentsSelection({
      filterSettings: coreAgentsFilterSettings,
      rowIds,
    });

  const toggleRow = (rowId: string) =>
    selectRows(
      toggleRowIdInSelection({ selectedRowIds: selectionRowIds, rowId }),
    );

  return {
    selectedRowIds,
    selectedRowCount: selectionRowIds.length,
    toggleRow,
    selectRows,
  };
};
