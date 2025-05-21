import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import {
  multipleRecordPickerHasNextPageSelector,
  multipleRecordPickerIsLoadingInitialSelector,
  multipleRecordPickerIsLoadingMoreSelector,
} from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPaginationSelectors';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
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

export const MultipleRecordPickerFetchMoreLoader = () => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
  );

  const hasNextPage = useRecoilComponentValueV2(
    multipleRecordPickerHasNextPageSelector,
    componentInstanceId,
  );

  const isLoadingMore = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingMoreSelector,
    componentInstanceId,
  );

  const isLoadingInitial = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingInitialSelector,
    componentInstanceId,
  );

  const searchFilter = useRecoilComponentValueV2(
    multipleRecordPickerSearchFilterComponentState,
    componentInstanceId,
  );

  const { performSearch } = useMultipleRecordPickerPerformSearch();

  const fetchMore = useRecoilCallback(
    () => async () => {
      if (isLoadingMore || !hasNextPage) {
        return;
      }

      performSearch({
        multipleRecordPickerInstanceId: componentInstanceId,
        forceSearchFilter: searchFilter,
        loadMore: true,
      });
    },
    [
      componentInstanceId,
      hasNextPage,
      isLoadingMore,
      performSearch,
      searchFilter,
    ],
  );

  const { ref } = useInView({
    onChange: useCallback(
      (inView: boolean) => {
        if (inView) {
          fetchMore();
        }
      },
      [fetchMore],
    ),
    threshold: 0,
    rootMargin: '200px',
  });

  if (!hasNextPage || isLoadingInitial) {
    return null;
  }

  return (
    <div ref={ref}>
      {isLoadingMore && <StyledText>Loading more...</StyledText>}
    </div>
  );
};
