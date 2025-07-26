import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useInitDraftValueV2 } from '@/object-record/record-field/hooks/useInitDraftValueV2';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { isInlineCellInEditModeScopedState } from '@/object-record/record-inline-cell/states/isInlineCellInEditModeScopedState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTitleCell = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const fieldContext = useContext(FieldContext);
  const objectNameSingular =
    fieldContext?.fieldDefinition?.metadata?.objectMetadataNameSingular;

  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNameSingular ?? '',
      objectNameType: 'singular',
    }),
  );

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
          isInlineCellInEditModeScopedState(
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
    ({ set, snapshot }) =>
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
        set(isInlineCellInEditModeScopedState(recordTitleCellId), true);

        const recordIndexFieldDefinitions = snapshot
          .getLoadable(recordIndexFieldDefinitionsState)
          .getValue();

        let fieldDefinition = recordIndexFieldDefinitions.find(
          (field) => field.metadata.fieldName === fieldName,
        );

        if (!fieldDefinition && isDefined(objectMetadataItem)) {
          const fieldDefinitions = objectMetadataItem.fields.map(
            (fieldMetadataItem, index) =>
              formatFieldMetadataItemAsColumnDefinition({
                field: fieldMetadataItem,
                objectMetadataItem,
                position: index,
              }),
          );

          fieldDefinition = fieldDefinitions.find(
            (field) => field.metadata.fieldName === fieldName,
          );
        }

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
    [initFieldInputDraftValue, objectMetadataItem, pushFocusItemToFocusStack],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
