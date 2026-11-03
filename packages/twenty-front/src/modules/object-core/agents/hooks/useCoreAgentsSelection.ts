import { PermissionFlagType } from 'twenty-shared/constants';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getSelectedCoreAgentIds } from '@/object-core/agents/utils/getSelectedCoreAgentIds';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreAgentsSelection = ({
  tableId,
  coreAgents,
}: {
  tableId: string;
  coreAgents: Pick<CoreAgent, 'id' | 'applicationId'>[];
}) => {
  const [selection, setSelection] = useAtomFamilyState(
    coreAgentsSelectionFamilyState,
    tableId,
  );
  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const canManageAgents = useHasPermissionFlag(PermissionFlagType.AI_SETTINGS);
  const selectedAgentIds = canManageAgents
    ? getSelectedCoreAgentIds({
        selection,
        filterSettings: coreAgentsFilterSettings,
        coreAgents,
        workspaceCustomApplicationId:
          currentWorkspace?.workspaceCustomApplication?.id,
      })
    : [];

  const selectRows = (rowIds: string[]) =>
    setSelection({ filterSettings: coreAgentsFilterSettings, rowIds });

  const toggleRow = (rowId: string) =>
    selectRows(
      toggleRowIdInSelection({ selectedRowIds: selectedAgentIds, rowId }),
    );

  return { selectedAgentIds, selectRows, toggleRow };
};
