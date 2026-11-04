import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getSelectedCoreAgentIds } from '@/object-core/agents/utils/getSelectedCoreAgentIds';
import { isCoreAgentMatchingFilterSettings } from '@/object-core/agents/utils/isCoreAgentMatchingFilterSettings';
import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

export const useCoreAgentsSelection = ({
  tableId,
  coreAgents,
}: {
  tableId: string;
  coreAgents: Pick<CoreAgent, 'id' | 'applicationId'>[];
}) => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const [selection] = useAtomFamilyState(
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

  const selectionAtom = coreAgentsSelectionFamilyState.getAtom(tableId, null);

  const getCurrentSelectedAgentIds = (rowIds?: string[]) => {
    if (
      !store.get(permissionFlagMapSelector.atom)[PermissionFlagType.AI_SETTINGS]
    ) {
      return [];
    }

    const filterSettings = store.get(coreAgentsFilterSettingsState.atom);
    const cachedAgents =
      apolloClient.readQuery({ query: FindManyAgentsDocument })
        ?.findManyAgents ?? [];

    return getSelectedCoreAgentIds({
      selection: isDefined(rowIds)
        ? { filterSettings, rowIds }
        : store.get(selectionAtom),
      filterSettings,
      coreAgents: cachedAgents.filter((agent) =>
        isCoreAgentMatchingFilterSettings({ agent, filterSettings }),
      ),
      workspaceCustomApplicationId: store.get(currentWorkspaceState.atom)
        ?.workspaceCustomApplication?.id,
    });
  };

  const selectRows = (rowIds: string[]) => {
    const filterSettings = store.get(coreAgentsFilterSettingsState.atom);
    store.set(selectionAtom, {
      filterSettings,
      rowIds: getCurrentSelectedAgentIds(rowIds),
    });
  };

  const toggleRow = (rowId: string) =>
    selectRows(
      toggleRowIdInSelection({
        selectedRowIds: getCurrentSelectedAgentIds(),
        rowId,
      }),
    );

  return { selectedAgentIds, selectRows, toggleRow };
};
