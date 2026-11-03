import { coreAgentsDeleteTargetFamilyState } from '@/object-core/agents/states/coreAgentsDeleteTargetFamilyState';
import { coreAgentsIsDeletingFamilyState } from '@/object-core/agents/states/coreAgentsIsDeletingFamilyState';
import { getCoreAgentsDeleteDialogId } from '@/object-core/agents/utils/getCoreAgentsDeleteDialogId';
import { readSelectedCoreAgentIds } from '@/object-core/agents/utils/readSelectedCoreAgentIds';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useOpenCoreAgentsDeleteDialog = (tableId: string) => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { openDialog } = useDialog();
  const openCoreAgentsDeleteDialog = () => {
    const canDelete = store.get(permissionFlagMapSelector.atom)[
      PermissionFlagType.AI_SETTINGS
    ];
    if (
      !canDelete ||
      store.get(coreAgentsIsDeletingFamilyState.getAtom(tableId, null))
    ) {
      return;
    }
    const agentIds = readSelectedCoreAgentIds({ store, apolloClient, tableId });
    if (!isNonEmptyArray(agentIds)) {
      return;
    }
    store.set(
      coreAgentsDeleteTargetFamilyState.getAtom(tableId, null),
      agentIds,
    );
    openDialog(getCoreAgentsDeleteDialogId(tableId));
  };
  return { openCoreAgentsDeleteDialog };
};
