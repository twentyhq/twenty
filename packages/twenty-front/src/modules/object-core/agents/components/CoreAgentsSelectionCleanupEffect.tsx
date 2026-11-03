import { useStore } from 'jotai';
import { useEffect } from 'react';

import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { coreAgentsSelectionFamilyState } from '@/object-core/agents/states/coreAgentsSelectionFamilyState';
import { getCoreAgentsDeleteDialogId } from '@/object-core/agents/utils/getCoreAgentsDeleteDialogId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';

type CoreAgentsSelectionCleanupEffectProps = {
  tableId: string;
};

export const CoreAgentsSelectionCleanupEffect = ({
  tableId,
}: CoreAgentsSelectionCleanupEffectProps) => {
  const store = useStore();
  const { closeDialog } = useDialog();
  const selectionAtom = coreAgentsSelectionFamilyState.getAtom(tableId, null);

  useEffect(
    () => () => {
      store.set(selectionAtom, EMPTY_CORE_AGENTS_SELECTION);
      closeDialog(getCoreAgentsDeleteDialogId(tableId));
    },
    [closeDialog, selectionAtom, store, tableId],
  );

  return null;
};
