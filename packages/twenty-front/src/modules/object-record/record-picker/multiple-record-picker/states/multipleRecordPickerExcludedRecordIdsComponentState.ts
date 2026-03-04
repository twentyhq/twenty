import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const multipleRecordPickerExcludedRecordIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'multipleRecordPickerExcludedRecordIdsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
