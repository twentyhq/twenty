import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { RecordTitleCellComponentInstanceContext } from '@/object-record/record-title-cell/states/contexts/RecordTitleCellComponentInstanceContext';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type OpenTitleCellFunctionParams = {
  recordId: string;
  fieldName: string;
};

export const useRecordTitleCell = (instanceIdFromProps?: string) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordTitleCellComponentInstanceContext,
    instanceIdFromProps,
  );

  const isTitleCellInEditModeState = useRecoilComponentCallbackState(
    isTitleCellInEditModeComponentState,
    instanceId,
  );

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { objectMetadataItem } = useContextStoreObjectMetadataItem();

  const closeRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isTitleCellInEditModeState, false);

        removeFocusItemFromFocusStackById({
          focusId: instanceId,
        });

        goBackToPreviousDropdownFocusId();
      },
    [
      goBackToPreviousDropdownFocusId,
      instanceId,
      isTitleCellInEditModeState,
      removeFocusItemFromFocusStackById,
    ],
  );

  const initFieldInputDraftValue = useInitDraftValue();

  const openRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({ recordId, fieldName }: OpenTitleCellFunctionParams) => {
        if (!isDefined(objectMetadataItem)) {
          throw new Error(
            'Cannot find object metadata item in openRecordTitleCell this should not happen.',
          );
        }

        pushFocusItemToFocusStack({
          focusId: instanceId,
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: instanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
            enableGlobalHotkeysWithModifiers: false,
          },
        });

        set(isTitleCellInEditModeState, true);

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
          fieldComponentInstanceId: instanceId,
        });
      },
    [
      objectMetadataItem,
      pushFocusItemToFocusStack,
      instanceId,
      isTitleCellInEditModeState,
      initFieldInputDraftValue,
    ],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
