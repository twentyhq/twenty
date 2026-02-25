import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { isSlashMenuOpenComponentState } from '@/blocknote-editor/states/isSlashMenuOpenComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export type BlockEditorDropdownFocusEffectProps = {
  editor: typeof BLOCK_SCHEMA.BlockNoteEditor;
};

export const BlockEditorDropdownFocusEffect = ({
  editor,
}: BlockEditorDropdownFocusEffectProps) => {
  const isSlashMenuOpenState = useAtomComponentStateCallbackState(
    isSlashMenuOpenComponentState,
  );

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const store = useStore();

  const updateCallBack = useCallback(
    (event: any) => {
      const eventWantsToOpen = event.show === true;

      const isAlreadyOpen = store.get(isSlashMenuOpenState);

      const shouldOpen = eventWantsToOpen && !isAlreadyOpen;

      if (shouldOpen) {
        setActiveDropdownFocusIdAndMemorizePrevious('custom-slash-menu');
        store.set(isSlashMenuOpenState, true);
        return;
      }

      const eventWantsToClose = event.show === false;

      const isAlreadyClosed = !isAlreadyOpen;

      const shouldClose = eventWantsToClose && !isAlreadyClosed;

      if (shouldClose) {
        goBackToPreviousDropdownFocusId();
        store.set(isSlashMenuOpenState, false);
        return;
      }
    },
    [
      isSlashMenuOpenState,
      setActiveDropdownFocusIdAndMemorizePrevious,
      goBackToPreviousDropdownFocusId,
      store,
    ],
  );

  editor.suggestionMenus.on('update /', updateCallBack);

  return <></>;
};
