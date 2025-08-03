import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { isInlineCellInEditModeFamilyState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeFamilyState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilCallback } from 'recoil';

export const useRecordTitleCell = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const closeRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({
        recordId,
        fieldName,
        containerType,
      }: {
        recordId: string;
        fieldName: string;
        containerType: RecordTitleCellContainerType;
      }) => {
        set(
          isInlineCellInEditModeFamilyState(
            getRecordFieldInputInstanceId({
              recordId,
              fieldName,
              prefix: containerType,
            }),
          ),
          false,
        );

        removeFocusItemFromFocusStackById({
          focusId: getRecordFieldInputInstanceId({
            recordId,
            fieldName,
            prefix: containerType,
          }),
        });

        goBackToPreviousDropdownFocusId();
      },
    [goBackToPreviousDropdownFocusId, removeFocusItemFromFocusStackById],
  );

  const initFieldInputDraftValue = useInitDraftValueV2();

  const openRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({
        recordId,
        fieldName,
        containerType,
      }: {
        recordId: string;
        fieldName: string;
        containerType: RecordTitleCellContainerType;
      }) => {
        pushFocusItemToFocusStack({
          focusId: getRecordFieldInputInstanceId({
            recordId,
            fieldName,
            prefix: containerType,
          }),
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: getRecordFieldInputInstanceId({
              recordId,
              fieldName,
              prefix: containerType,
            }),
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
            enableGlobalHotkeysWithModifiers: false,
          },
        });

        const recordTitleCellId = getRecordFieldInputInstanceId({
          recordId,
          fieldName,
          prefix: containerType,
        });
        set(isInlineCellInEditModeFamilyState(recordTitleCellId), true);

        const fieldDefinitions = objectMetadataItem.fields.map(
          (fieldMetadataItem, index) =>
            formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              objectMetadataItem,
              position: index,
            }),
        );

        const fieldDefinition = fieldDefinitions.find(
          (field) => field.metadata.fieldName === fieldName,
        );

        if (!fieldDefinition) {
          throw new Error(
            `Cannot find field definition for field name ${fieldName}, this should not happen.`,
          );
        }

        initFieldInputDraftValue({
          recordId,
          fieldDefinition,
          fieldComponentInstanceId: recordTitleCellId,
        });
      },
    [initFieldInputDraftValue, pushFocusItemToFocusStack, objectMetadataItem],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
