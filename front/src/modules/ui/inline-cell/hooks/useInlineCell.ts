import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/ui/field/contexts/FieldContext';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { isInlineCellInEditModeScopedState } from '../states/isInlineCellInEditModeScopedState';
import { InlineCellHotkeyScope } from '../types/InlineCellHotkeyScope';

export const useInlineCell = () => {
  const { recoilScopeId } = useContext(FieldContext);

  const [isInlineCellInEditMode, setIsInlineCellInEditMode] = useRecoilState(
    isInlineCellInEditModeScopedState(recoilScopeId),
  );

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeInlineCell = () => {
    setIsInlineCellInEditMode(false);

    goBackToPreviousHotkeyScope();
  };

  const openInlineCell = (customEditHotkeyScopeForField?: HotkeyScope) => {
    setIsInlineCellInEditMode(true);

    if (customEditHotkeyScopeForField) {
      setHotkeyScopeAndMemorizePreviousScope(
        customEditHotkeyScopeForField.scope,
        customEditHotkeyScopeForField.customScopes,
      );
    } else {
      setHotkeyScopeAndMemorizePreviousScope(InlineCellHotkeyScope.InlineCell);
    }
  };

  return {
    isInlineCellInEditMode,
    closeInlineCell,
    openInlineCell,
  };
};
