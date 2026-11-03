import { coreAgentsSelectionOwnerCountFamilyState } from '@/object-core/agents/states/coreAgentsSelectionOwnerCountFamilyState';
import { releaseCoreAgentsSelectionIfUnowned } from '@/object-core/agents/utils/releaseCoreAgentsSelectionIfUnowned';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useStore } from 'jotai';
import { useEffect } from 'react';

type CoreAgentsSelectionCleanupEffectProps = { tableId: string };

export const CoreAgentsSelectionCleanupEffect = ({
  tableId,
}: CoreAgentsSelectionCleanupEffectProps) => {
  const store = useStore();
  const { closeDialog } = useDialog();
  useEffect(() => {
    const ownerAtom = coreAgentsSelectionOwnerCountFamilyState.getAtom(
      tableId,
      null,
    );
    store.set(ownerAtom, (count) => count + 1);
    return () => {
      store.set(ownerAtom, (count) => Math.max(0, count - 1));
      queueMicrotask(() =>
        releaseCoreAgentsSelectionIfUnowned({ store, tableId, closeDialog }),
      );
    };
  }, [store, closeDialog, tableId]);
  return null;
};
