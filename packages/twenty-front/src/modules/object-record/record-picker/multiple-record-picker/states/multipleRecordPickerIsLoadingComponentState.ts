import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const multipleRecordPickerIsLoadingComponentState =
  createComponentState<boolean>({
    key: 'multipleRecordPickerIsLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
