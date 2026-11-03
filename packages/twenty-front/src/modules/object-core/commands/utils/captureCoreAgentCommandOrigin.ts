import { releaseCoreAgentsSelectionIfUnowned } from '@/object-core/agents/utils/releaseCoreAgentsSelectionIfUnowned';
import { coreAgentCommandOriginFamilyState } from '@/object-core/commands/states/coreAgentCommandOriginFamilyState';
import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
import { routedFlowStateScopeRegistry } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type Store = ReturnType<typeof createStore>;
type CloseDialog = (dialogId: string) => void;
const CAPTURED_SELECTIONS_BY_SCOPE = new Map<
  string,
  Map<Store, Map<string, CloseDialog>>
>();

routedFlowStateScopeRegistry.registerRelease((scopeId) => {
  const selectionsByStore = CAPTURED_SELECTIONS_BY_SCOPE.get(scopeId);
  CAPTURED_SELECTIONS_BY_SCOPE.delete(scopeId);
  if (!isDefined(selectionsByStore)) {
    return;
  }
  for (const [store, selections] of selectionsByStore) {
    for (const [tableId, closeDialog] of selections) {
      queueMicrotask(() =>
        releaseCoreAgentsSelectionIfUnowned({ store, tableId, closeDialog }),
      );
    }
  }
});

type CaptureCoreAgentCommandOriginArgs = {
  store: Store;
  pageId: string;
  origin: CoreAgentCommandOrigin;
  closeDialog: CloseDialog;
};

export const captureCoreAgentCommandOrigin = ({
  store,
  pageId,
  origin,
  closeDialog,
}: CaptureCoreAgentCommandOriginArgs) => {
  const scopeId = origin.scopeId ?? pageId;
  const capturedOrigin = { ...origin, scopeId };
  store.set(
    coreAgentCommandOriginFamilyState.getAtom(pageId, scopeId),
    capturedOrigin,
  );
  if (origin.target.type === 'index') {
    const selectionsByStore =
      CAPTURED_SELECTIONS_BY_SCOPE.get(scopeId) ??
      new Map<Store, Map<string, CloseDialog>>();
    const selections =
      selectionsByStore.get(store) ?? new Map<string, CloseDialog>();
    selections.set(origin.target.tableId, closeDialog);
    selectionsByStore.set(store, selections);
    CAPTURED_SELECTIONS_BY_SCOPE.set(scopeId, selectionsByStore);
  }
  return capturedOrigin;
};
