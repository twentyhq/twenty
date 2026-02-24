import { SuggestionMenu } from '@blocknote/core/extensions';
import { useExtensionState } from '@blocknote/react';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { isSlashMenuOpenComponentState } from '@/blocknote-editor/states/isSlashMenuOpenComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';

export const BlockEditorDropdownFocusEffect = () => {
  const isSlashMenuOpenState = useRecoilComponentCallbackState(
    isSlashMenuOpenComponentState,
  );

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const suggestionState = useExtensionState(SuggestionMenu);

  const isSlashMenuShowing =
    suggestionState?.show === true && suggestionState?.triggerCharacter === '/';

  const syncSlashMenuState = useRecoilCallback(
    ({ snapshot, set }) =>
      (showing: boolean) => {
        const isAlreadyOpen = snapshot
          .getLoadable(isSlashMenuOpenState)
          .getValue();

        if (showing && !isAlreadyOpen) {
          setActiveDropdownFocusIdAndMemorizePrevious('custom-slash-menu');
          set(isSlashMenuOpenState, true);
        } else if (!showing && isAlreadyOpen) {
          goBackToPreviousDropdownFocusId();
          set(isSlashMenuOpenState, false);
        }
      },
    [
      isSlashMenuOpenState,
      setActiveDropdownFocusIdAndMemorizePrevious,
      goBackToPreviousDropdownFocusId,
    ],
  );

  useEffect(() => {
    syncSlashMenuState(isSlashMenuShowing);
  }, [isSlashMenuShowing, syncSlashMenuState]);

  return null;
};
