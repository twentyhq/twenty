import { useContextStoreObjectMetadataItem } from '@/context-store/hooks/useContextStoreObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useInitDraftValue } from '@/object-record/record-field/ui/hooks/useInitDraftValue';
import { RecordTitleCellComponentInstanceContext } from '@/object-record/record-title-cell/states/contexts/RecordTitleCellComponentInstanceContext';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type OpenTitleCellFunctionParams = {
  recordId: string;
  fieldName: string;
  instanceId?: string;
};

export const useRecordTitleCell = () => {
  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const instanceId = useAvailableComponentInstanceId(
    RecordTitleCellComponentInstanceContext,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { objectMetadataItem } = useContextStoreObjectMetadataItem();

  const closeRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      (instanceIdFromProps?: string) => {
        const computedInstanceId = instanceIdFromProps ?? instanceId;

        if (!isDefined(computedInstanceId)) {
          throw new Error(
            'Instance ID is not defined in closeRecordTitleCell this should not happen.',
          );
        }
        set(
          isTitleCellInEditModeComponentState.atomFamily({
            instanceId: computedInstanceId,
          }),
          false,
        );

        removeFocusItemFromFocusStackById({
          focusId: computedInstanceId,
        });

        goBackToPreviousDropdownFocusId();
      },
    [
      goBackToPreviousDropdownFocusId,
      instanceId,
      removeFocusItemFromFocusStackById,
    ],
  );

  const initFieldInputDraftValue = useInitDraftValue();

  const openRecordTitleCell = useRecoilCallback(
    ({ set }) =>
      ({
        recordId,
        fieldName,
        instanceId: instanceIdFromProps,
      }: OpenTitleCellFunctionParams) => {
        if (!isDefined(objectMetadataItem)) {
          throw new Error(
            'Cannot find object metadata item in openRecordTitleCell this should not happen.',
          );
        }

        const computedInstanceId = instanceIdFromProps ?? instanceId;

        if (!isDefined(computedInstanceId)) {
          throw new Error(
            'Instance ID is not defined in openRecordTitleCell this should not happen.',
          );
        }

        pushFocusItemToFocusStack({
          focusId: computedInstanceId,
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: computedInstanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
            enableGlobalHotkeysWithModifiers: false,
          },
        });

        set(
          isTitleCellInEditModeComponentState.atomFamily({
            instanceId: computedInstanceId,
          }),
          true,
        );

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
          fieldComponentInstanceId: computedInstanceId,
        });
      },
    [
      objectMetadataItem,
      instanceId,
      pushFocusItemToFocusStack,
      initFieldInputDraftValue,
    ],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
