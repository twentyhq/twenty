import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerPaginationSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPaginationSelectors';
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

  const paginationState = useRecoilComponentValueV2(
    multipleRecordPickerPaginationSelector,
    componentInstanceId,
  );

  const searchFilter = useRecoilComponentValueV2(
    multipleRecordPickerSearchFilterComponentState,
    componentInstanceId,
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

        if (paginationState.isLoadingMore || !paginationState.hasNextPage) {
          return;
        }

        performSearch({
          multipleRecordPickerInstanceId: componentInstanceId,
          forceSearchFilter: searchFilter,
          loadMore: true,
        });
      },
    [componentInstanceId, performSearch, searchFilter],
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

  if (!paginationState.hasNextPage || paginationState.isLoadingInitial) {
    return null;
  }

  return (
    <div ref={ref}>
      {paginationState.isLoadingMore && (
        <StyledText>Loading more...</StyledText>
      )}
    </div>
  );
};
