import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

export const multipleRecordPickerAdditionalFilterComponentState =
  createAtomComponentState<ObjectRecordFilterInput | undefined>({
    key: 'multipleRecordPickerAdditionalFilterComponentState',
    defaultValue: undefined,
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
