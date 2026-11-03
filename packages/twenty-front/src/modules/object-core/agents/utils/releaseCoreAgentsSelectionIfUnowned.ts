import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { coreAgentsSelectionOwnerCountFamilyState } from '@/object-core/agents/states/coreAgentsSelectionOwnerCountFamilyState';
import { getCoreAgentsDeleteDialogId } from '@/object-core/agents/utils/getCoreAgentsDeleteDialogId';
import { coreAgentCommandOriginFamilyState } from '@/object-core/commands/states/coreAgentCommandOriginFamilyState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { type createStore } from 'jotai';

type ReleaseCoreAgentsSelectionIfUnownedArgs = {
  store: ReturnType<typeof createStore>;
  tableId: string;
  closeDialog: (dialogId: string) => void;
};

export const releaseCoreAgentsSelectionIfUnowned = ({
  store,
  tableId,
  closeDialog,
}: ReleaseCoreAgentsSelectionIfUnownedArgs) => {
  if (
    store.get(coreAgentsSelectionOwnerCountFamilyState.getAtom(tableId, null)) >
    0
  ) {
    return;
  }
  const hasCapturedSelection = store
    .get(sidePanelNavigationStackState.atom)
    .some(({ pageId, routedFlowStateScopeId }) => {
      const origin = store.get(
        coreAgentCommandOriginFamilyState.getAtom(
          pageId,
          routedFlowStateScopeId ?? null,
        ),
      );
      return (
        origin?.target.type === 'index' && origin.target.tableId === tableId
      );
    });
  if (hasCapturedSelection) {
    return;
  }
  store.set(
    coreAgentsSelectionFamilyState.getAtom(tableId, null),
    EMPTY_CORE_AGENTS_SELECTION,
  );
  closeDialog(getCoreAgentsDeleteDialogId(tableId));
};
