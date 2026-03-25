import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type MultipleRecordPickerPaginationState = {
  endCursor: string | null;
  hasNextPage: boolean;
};

export const multipleRecordPickerPaginationState =
  createAtomComponentState<MultipleRecordPickerPaginationState>({
    key: 'multipleRecordPickerPaginationState',
    defaultValue: {
      endCursor: null,
      hasNextPage: false,
    },
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
