import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared';

export const useMultipleRecordPickerSetMorphItem = (
  componentInstanceIdFromProps: string,
) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
    componentInstanceIdFromProps,
  );

  const setMorphItem = useRecoilCallback(
    ({ set, snapshot }) => {
      return (morphItem: RecordPickerPickableMorphItem) => {
        const currentPickableMorphItems = snapshot
          .getLoadable(
            multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
              instanceId,
            }),
          )
          .getValue();

        const currentPickableMorphItem = currentPickableMorphItems.find(
          (item) =>
            item.recordId === morphItem.recordId &&
            item.objectMetadataId === morphItem.objectMetadataId,
        );

        if (isDefined(currentPickableMorphItem)) {
          const newPickableMorphItems = currentPickableMorphItems.filter(
            (item) =>
              item.recordId !== morphItem.recordId ||
              item.objectMetadataId !== morphItem.objectMetadataId,
          );

          set(
            multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
              instanceId,
            }),
            [...newPickableMorphItems, morphItem],
          );
        } else {
          set(
            multipleRecordPickerPickableMorphItemsComponentState.atomFamily({
              instanceId,
            }),
            [...currentPickableMorphItems, morphItem],
          );
        }
      };
    },
    [instanceId],
  );

  return { setMorphItem };
};
