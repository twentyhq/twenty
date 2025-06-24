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
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilCallback } from 'recoil';
import { GRAY_SCALE } from 'twenty-ui/theme';

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${GRAY_SCALE.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledIntersectionObserver = styled.div`
  height: 0px;
`;

export const MultipleRecordPickerFetchMoreLoader = () => {
  const [
    multipleRecordPickerIsFetchingMore,
    setMultipleRecordPickerIsFetchingMore,
  ] = useRecoilComponentStateV2(
    multipleRecordPickerIsFetchingMoreComponentState,
  );

  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const paginationState = useRecoilComponentValueV2(
    multipleRecordPickerPaginationSelector,
    componentInstanceId,
  );

  const isLoading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
    componentInstanceId,
  );

  const searchFilter = useRecoilComponentValueV2(
    multipleRecordPickerSearchFilterComponentState,
    componentInstanceId,
  );

  const multipleRecordPickerShouldShowInitialLoading =
    useRecoilComponentValueV2(
      multipleRecordPickerShouldShowInitialLoadingComponentState,
    );

  const multipleRecordPickerShouldShowSkeleton = useRecoilComponentValueV2(
    multipleRecordPickerShouldShowSkeletonComponentState,
  );

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const fetchMore = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const paginationState = snapshot
          .getLoadable(
            multipleRecordPickerPaginationState.atomFamily({
              instanceId: componentInstanceId,
            }),
          )
          .getValue();

        if (isLoading || !paginationState.hasNextPage) {
          return;
        }

        await performSearch({
          multipleRecordPickerInstanceId: componentInstanceId,
          forceSearchFilter: searchFilter,
          loadMore: true,
        });
      },
    [componentInstanceId, performSearch, searchFilter, isLoading],
  );

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
    (isLoading && !multipleRecordPickerIsFetchingMore)
  ) {
    return null;
  }

  return (
    <>
      <StyledIntersectionObserver ref={ref} />
      {multipleRecordPickerIsFetchingMore && (
        <StyledText>Loading more...</StyledText>
      )}
    </>
  );
};
