import { SuggestionMenu } from '@blocknote/core/extensions';
import { useExtensionState } from '@blocknote/react';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';

import { isSlashMenuOpenComponentState } from '@/blocknote-editor/states/isSlashMenuOpenComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const BlockEditorDropdownFocusEffect = () => {
  const [prevShowing, setPrevShowing] = useState<boolean | null>(null);

  const isSlashMenuOpenState = useAtomComponentStateCallbackState(
    isSlashMenuOpenComponentState,
  );

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const store = useStore();

  const suggestionState = useExtensionState(SuggestionMenu);

  const isSlashMenuShowing =
    suggestionState?.show === true && suggestionState?.triggerCharacter === '/';

  const syncSlashMenuState = useCallback(
    (showing: boolean) => {
      const isAlreadyOpen = store.get(isSlashMenuOpenState);

      if (showing && isAlreadyOpen !== true) {
        setActiveDropdownFocusIdAndMemorizePrevious('custom-slash-menu');
        store.set(isSlashMenuOpenState, true);
      } else if (!showing && isAlreadyOpen === true) {
        goBackToPreviousDropdownFocusId();
        store.set(isSlashMenuOpenState, false);
      }
    },
    [
      isSlashMenuOpenState,
      setActiveDropdownFocusIdAndMemorizePrevious,
      goBackToPreviousDropdownFocusId,
      store,
    ],
  );

  if (prevShowing !== isSlashMenuShowing) {
    setPrevShowing(isSlashMenuShowing);
    syncSlashMenuState(isSlashMenuShowing);
  }

  return <></>;
};
