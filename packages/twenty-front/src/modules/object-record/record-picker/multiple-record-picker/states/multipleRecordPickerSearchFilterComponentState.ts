import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const multipleRecordPickerSearchFilterComponentState =
  createAtomComponentState<string>({
    key: 'multipleRecordPickerSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
