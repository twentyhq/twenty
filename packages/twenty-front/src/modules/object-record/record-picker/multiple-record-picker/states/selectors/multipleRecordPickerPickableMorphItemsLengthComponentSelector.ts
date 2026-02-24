import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';

export const multipleRecordPickerPickableMorphItemsLengthComponentSelector =
  createComponentSelectorV2<number>({
    key: 'multipleRecordPickerPickableMorphItemsLengthComponentSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const pickableMorphItems = get(
          multipleRecordPickerPickableMorphItemsComponentState,
          { instanceId },
        );

        return pickableMorphItems.length;
      },
  });
