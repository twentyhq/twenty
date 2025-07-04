import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/object-record/record-inline-cell/constants/InlineCellHotkeyScopeMemoizeKey';
import { isInlineCellInEditModeScopedState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeScopedState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordTitleCellId } from '@/object-record/record-title-cell/utils/getRecordTitleCellId';
import { TitleInputHotkeyScope } from '@/ui/input/types/TitleInputHotkeyScope';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTitleCell = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

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

        removeFocusItemFromFocusStackById({
          focusId: getRecordTitleCellId(
            recordId,
            fieldMetadataId,
            containerType,
          ),
        });

        goBackToPreviousDropdownFocusId();
      },
    [goBackToPreviousDropdownFocusId, removeFocusItemFromFocusStackById],
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
          pushFocusItemToFocusStack({
            focusId: getRecordTitleCellId(
              recordId,
              fieldMetadataId,
              containerType,
            ),
            component: {
              type: FocusComponentType.OPENED_FIELD_INPUT,
              instanceId: getRecordTitleCellId(
                recordId,
                fieldMetadataId,
                containerType,
              ),
            },
            hotkeyScope: customEditHotkeyScopeForField,
            memoizeKey: INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY,
          });
        } else {
          pushFocusItemToFocusStack({
            focusId: getRecordTitleCellId(
              recordId,
              fieldMetadataId,
              containerType,
            ),
            component: {
              type: FocusComponentType.OPENED_FIELD_INPUT,
              instanceId: getRecordTitleCellId(
                recordId,
                fieldMetadataId,
                containerType,
              ),
            },
            hotkeyScope: {
              scope: TitleInputHotkeyScope.TitleInput,
            },
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
    [initFieldInputDraftValue, pushFocusItemToFocusStack],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
