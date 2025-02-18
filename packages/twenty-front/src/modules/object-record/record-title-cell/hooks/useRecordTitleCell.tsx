import { isInlineCellInEditModeScopedState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeScopedState';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useRecordTitleCell = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const closeRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({
        recordId,
        fieldMetadataId,
      }: {
        recordId: string;
        fieldMetadataId: string;
      }) => {
        set(
          isInlineCellInEditModeScopedState(recordId + fieldMetadataId),
          false,
        );

        goBackToPreviousHotkeyScope();

        goBackToPreviousDropdownFocusId();
      },
    [goBackToPreviousDropdownFocusId, goBackToPreviousHotkeyScope],
  );

  const openRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({
        recordId,
        fieldMetadataId,
        customEditHotkeyScopeForField,
      }: {
        recordId: string;
        fieldMetadataId: string;
        customEditHotkeyScopeForField?: HotkeyScope;
      }) => {
        set(
          isInlineCellInEditModeScopedState(recordId + fieldMetadataId),
          true,
        );

        if (isDefined(customEditHotkeyScopeForField)) {
          setHotkeyScopeAndMemorizePreviousScope(
            customEditHotkeyScopeForField.scope,
            customEditHotkeyScopeForField.customScopes,
          );
        } else {
          setHotkeyScopeAndMemorizePreviousScope(
            InlineCellHotkeyScope.InlineCell,
          );
        }
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
