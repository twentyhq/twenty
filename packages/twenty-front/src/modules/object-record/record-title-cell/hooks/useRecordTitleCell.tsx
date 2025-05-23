import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
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
  } = usePreviousHotkeyScope();

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

        goBackToPreviousHotkeyScope(INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY);

        goBackToPreviousDropdownFocusId();
      },
    [goBackToPreviousDropdownFocusId, goBackToPreviousHotkeyScope],
  );

  const initFieldInputDraftValue = useInitDraftValueV2();

  const openRecordTitleCell = useRecoilCallback(
    ({ set, snapshot }) =>
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
        if (isDefined(customEditHotkeyScopeForField)) {
          setHotkeyScopeAndMemorizePreviousScope({
            scope: customEditHotkeyScopeForField.scope,
            customScopes: customEditHotkeyScopeForField.customScopes,
            memoizeKey: INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY,
          });
        } else {
          setHotkeyScopeAndMemorizePreviousScope({
            scope: TitleInputHotkeyScope.TitleInput,
            memoizeKey: INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY,
          });
        }

        const recordTitleCellId = getRecordTitleCellId(
          recordId,
          fieldMetadataId,
          containerType,
        );
        set(isInlineCellInEditModeScopedState(recordTitleCellId), true);

        const recordIndexFieldDefinitions = snapshot
          .getLoadable(recordIndexFieldDefinitionsState)
          .getValue();

        const fieldDefinition = recordIndexFieldDefinitions.find(
          (field) => field.fieldMetadataId === fieldMetadataId,
        );

        if (!fieldDefinition) {
          return;
        }

        initFieldInputDraftValue({
          recordId,
          fieldDefinition,
          fieldComponentInstanceId: recordTitleCellId,
        });
      },
    [initFieldInputDraftValue, setHotkeyScopeAndMemorizePreviousScope],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
