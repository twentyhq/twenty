import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { createComponentSelector } from '@/ui/utilities/state/jotai/utils/createComponentSelector';

export const multipleRecordPickerPickableMorphItemsLengthComponentSelector =
  createComponentSelector<number>({
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
