import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { isDefined } from '~/utils/isDefined';

import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { isInlineCellInEditModeScopedState } from '../states/isInlineCellInEditModeScopedState';
import { InlineCellHotkeyScope } from '../types/InlineCellHotkeyScope';

export const useInlineCell = () => {
  const {
    recoilScopeId = '',
    recordId,
    fieldDefinition,
  } = useContext(FieldContext);

  const [isInlineCellInEditMode, setIsInlineCellInEditMode] = useRecoilState(
    isInlineCellInEditModeScopedState(recoilScopeId),
  );

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const initFieldInputDraftValue = useInitDraftValueV2();

  const closeInlineCell = () => {
    setIsInlineCellInEditMode(false);

    goBackToPreviousHotkeyScope();
  };

  const openInlineCell = (customEditHotkeyScopeForField?: HotkeyScope) => {
    setIsInlineCellInEditMode(true);
    initFieldInputDraftValue({ recordId, fieldDefinition });

    if (isDefined(customEditHotkeyScopeForField)) {
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
