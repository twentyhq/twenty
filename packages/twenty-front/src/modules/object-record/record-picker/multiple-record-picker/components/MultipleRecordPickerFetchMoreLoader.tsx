import { t } from '@lingui/core/macro';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';

import { multipleRecordPickerIsFetchingMoreComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsFetchingMoreComponentState';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';

import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerShouldShowInitialLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowInitialLoadingComponentState';
import { multipleRecordPickerShouldShowSkeletonComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerShouldShowSkeletonComponentState';
import { multipleRecordPickerPaginationSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPaginationSelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useStore } from 'jotai';

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${({ theme }) => theme.grayScale.gray9};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledIntersectionObserver = styled.div`
  height: 0px;
`;

export const MultipleRecordPickerFetchMoreLoader = () => {
  const store = useStore();
  const [
    multipleRecordPickerIsFetchingMore,
    setMultipleRecordPickerIsFetchingMore,
  ] = useAtomComponentState(multipleRecordPickerIsFetchingMoreComponentState);

  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const paginationState = useAtomComponentSelectorValue(
    multipleRecordPickerPaginationSelector,
    componentInstanceId,
  );

  const multipleRecordPickerIsLoading = useAtomComponentStateValue(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const multipleRecordPickerSearchFilter = useAtomComponentStateValue(
    multipleRecordPickerSearchFilterComponentState,
    componentInstanceId,
  );

  const multipleRecordPickerShouldShowInitialLoading =
    useAtomComponentStateValue(
      multipleRecordPickerShouldShowInitialLoadingComponentState,
    );

  const multipleRecordPickerShouldShowSkeleton = useAtomComponentStateValue(
    multipleRecordPickerShouldShowSkeletonComponentState,
  );

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const fetchMore = useCallback(async () => {
    const currentPaginationState = store.get(
      multipleRecordPickerPaginationState.atomFamily({
        instanceId: componentInstanceId,
      }),
    );

    if (multipleRecordPickerIsLoading || !currentPaginationState.hasNextPage) {
      return;
    }

    await performSearch({
      multipleRecordPickerInstanceId: componentInstanceId,
      forceSearchFilter: multipleRecordPickerSearchFilter,
      loadMore: true,
    });
  }, [
    componentInstanceId,
    performSearch,
    multipleRecordPickerSearchFilter,
    multipleRecordPickerIsLoading,
    store,
  ]);

  const { ref } = useInView({
    onChange: useCallback(
      async (inView: boolean) => {
        if (inView) {
          setMultipleRecordPickerIsFetchingMore(true);

          await fetchMore();

          setMultipleRecordPickerIsFetchingMore(false);
        }
      },
      [fetchMore, setMultipleRecordPickerIsFetchingMore],
    ),
  });

  if (
    !paginationState.hasNextPage ||
    multipleRecordPickerShouldShowInitialLoading ||
    multipleRecordPickerShouldShowSkeleton ||
    (multipleRecordPickerIsLoading && !multipleRecordPickerIsFetchingMore)
  ) {
    return null;
  }

  return (
    <>
      <StyledIntersectionObserver ref={ref} />
      {multipleRecordPickerIsFetchingMore && (
        <StyledText>{t`Loading more...`}</StyledText>
      )}
    </>
  );
};
