import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const multipleRecordPickerIsFetchingMoreComponentState =
  createComponentState<boolean>({
    key: 'multipleRecordPickerIsFetchingMoreComponentState',
    defaultValue: false,
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
