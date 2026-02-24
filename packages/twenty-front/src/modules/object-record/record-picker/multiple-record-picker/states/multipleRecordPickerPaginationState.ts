import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export type MultipleRecordPickerPaginationState = {
  endCursor: string | null;
  hasNextPage: boolean;
};

export const multipleRecordPickerPaginationState =
  createComponentState<MultipleRecordPickerPaginationState>({
    key: 'multipleRecordPickerPaginationState',
    defaultValue: {
      endCursor: null,
      hasNextPage: false,
    },
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
