import { INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/object-record/record-inline-cell/constants/InlineCellHotkeyScopeMemoizeKey';
import { isInlineCellInEditModeScopedState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeScopedState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordTitleCellId } from '@/object-record/record-title-cell/utils/getRecordTitleCellId';
import { TitleInputHotkeyScope } from '@/ui/input/types/TitleInputHotkeyScope';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
export const useRecordTitleCell = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope(INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY);

  const closeRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({
        recordId,
        fieldMetadataId,
        containerType,
      }: {
        recordId: string;
        fieldMetadataId: string;
        containerType: RecordTitleCellContainerType;
      }) => {
        set(
          isInlineCellInEditModeScopedState(
            getRecordTitleCellId(recordId, fieldMetadataId, containerType),
          ),
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
        containerType,
        customEditHotkeyScopeForField,
      }: {
        recordId: string;
        fieldMetadataId: string;
        containerType: RecordTitleCellContainerType;
        customEditHotkeyScopeForField?: HotkeyScope;
      }) => {
        set(
          isInlineCellInEditModeScopedState(
            getRecordTitleCellId(recordId, fieldMetadataId, containerType),
          ),
          true,
        );

        if (isDefined(customEditHotkeyScopeForField)) {
          setHotkeyScopeAndMemorizePreviousScope(
            customEditHotkeyScopeForField.scope,
            customEditHotkeyScopeForField.customScopes,
          );
        } else {
          setHotkeyScopeAndMemorizePreviousScope(
            TitleInputHotkeyScope.TitleInput,
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
