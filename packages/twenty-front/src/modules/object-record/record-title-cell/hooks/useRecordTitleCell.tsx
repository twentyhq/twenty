import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
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
  fieldMetadataItemId: string;
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

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

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
        fieldMetadataItemId,
        instanceId: instanceIdFromProps,
      }: OpenTitleCellFunctionParams) => {
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

        const { fieldMetadataItem, objectMetadataItem } =
          getFieldMetadataItemByIdOrThrow(fieldMetadataItemId);

        const fieldDefinition = formatFieldMetadataItemAsColumnDefinition({
          field: fieldMetadataItem,
          objectMetadataItem,
          position: 0,
        });

        initFieldInputDraftValue({
          recordId,
          fieldDefinition,
          fieldComponentInstanceId: computedInstanceId,
        });
      },
    [
      instanceId,
      pushFocusItemToFocusStack,
      initFieldInputDraftValue,
      getFieldMetadataItemByIdOrThrow,
    ],
  );

  return {
    closeRecordTitleCell,
    openRecordTitleCell,
  };
};
