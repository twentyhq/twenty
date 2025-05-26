import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export type MultipleRecordPickerPaginationState = {
  endCursor: string | null;
  hasNextPage: boolean;
};

export const multipleRecordPickerPaginationState =
  createComponentStateV2<MultipleRecordPickerPaginationState>({
    key: 'multipleRecordPickerPaginationState',
    defaultValue: {
      endCursor: null,
      hasNextPage: false,
    },
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
