import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const multipleRecordPickerSearchFilterComponentState =
  createComponentStateV2<string>({
    key: 'multipleRecordPickerSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
