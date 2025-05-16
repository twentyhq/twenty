import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export type MultipleRecordPickerPaginationState = {
  currentOffset: number;
  hasMore: boolean;
  pageSize: number;
  isLoadingMore: boolean;
};

export const multipleRecordPickerPaginationState =
  createComponentStateV2<MultipleRecordPickerPaginationState>({
    key: 'multipleRecordPickerPaginationState',
    defaultValue: {
      currentOffset: 0,
      hasMore: true,
      pageSize: 20,
      isLoadingMore: false,
    },
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
