import { t } from '@lingui/core/macro';
import { useDropdownPage } from 'twenty-ui/components/navigation';
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
import { styled } from '@linaria/react';
import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useStore } from 'jotai';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${themeCssVariables.grayScale.gray9};
  display: flex;
  height: 32px;
  margin-left: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledIntersectionObserver = styled.div`
  height: 0px;
`;

export const MultipleRecordPickerFetchMoreLoader = () => {
  const store = useStore();
  const { isActive } = useDropdownPage();
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
    const currentSearchFilter = store.get(
      multipleRecordPickerSearchFilterComponentState.atomFamily({
        instanceId: componentInstanceId,
      }),
    );
    const isNewSearchPending =
      currentPaginationState.searchFilter !== currentSearchFilter;

    if (
      !isActive ||
      multipleRecordPickerIsLoading ||
      isNewSearchPending ||
      !currentPaginationState.hasNextPage
    ) {
      return;
    }

    await performSearch({
      multipleRecordPickerInstanceId: componentInstanceId,
      forceSearchFilter: currentPaginationState.searchFilter,
      loadMore: true,
    });
  }, [
    componentInstanceId,
    isActive,
    performSearch,
    multipleRecordPickerIsLoading,
    store,
  ]);

  const { ref } = useInView({
    skip: !isActive,
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
    !isActive ||
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
