import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const multipleRecordPickerEndCursorSelector = createComponentSelectorV2({
  key: 'multipleRecordPickerEndCursorSelector',
  componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const paginationState = get(
        multipleRecordPickerPaginationState.atomFamily({
          instanceId,
        }),
      );
      return paginationState.endCursor;
    },
});

export const multipleRecordPickerHasNextPageSelector =
  createComponentSelectorV2({
    key: 'multipleRecordPickerHasNextPageSelector',
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const paginationState = get(
          multipleRecordPickerPaginationState.atomFamily({
            instanceId,
          }),
        );
        return paginationState.hasNextPage;
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
