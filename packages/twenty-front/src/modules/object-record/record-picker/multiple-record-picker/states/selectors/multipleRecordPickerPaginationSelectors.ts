import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const multipleRecordPickerCurrentOffsetSelector =
  createComponentSelectorV2({
    key: 'multipleRecordPickerCurrentOffsetSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const paginationState = get(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId,
          }),
        );
        return paginationState.currentOffset;
      },
  });

export const multipleRecordPickerHasMoreSelector = createComponentSelectorV2({
  key: 'multipleRecordPickerHasMoreSelector',
  componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const paginationState = get(
        multipleRecordPickerPaginationState.atomFamily({
          instanceId,
        }),
      );
      return paginationState.hasMore;
    },
});

export const multipleRecordPickerPageSizeSelector = createComponentSelectorV2({
  key: 'multipleRecordPickerPageSizeSelector',
  componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const paginationState = get(
        multipleRecordPickerPaginationState.atomFamily({
          instanceId,
        }),
      );
      return paginationState.pageSize;
    },
});

export const multipleRecordPickerIsLoadingMoreSelector =
  createComponentSelectorV2({
    key: 'multipleRecordPickerIsLoadingMoreSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const paginationState = get(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId,
          }),
        );
        return paginationState.isLoadingMore;
      },
  });

export const multipleRecordPickerIsLoadingInitialSelector =
  createComponentSelectorV2({
    key: 'multipleRecordPickerIsLoadingInitialSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const paginationState = get(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId,
          }),
        );
        return paginationState.isLoadingInitial;
      },
  });
