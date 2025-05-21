import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerPaginationState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPaginationState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerPaginationSelector } from '@/object-record/record-picker/multiple-record-picker/states/selectors/multipleRecordPickerPaginationSelector';
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

  const isLoading = useRecoilComponentValueV2(
    multipleRecordPickerIsLoadingComponentState,
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

        if (isLoading || !paginationState.hasNextPage) {
          return;
        }

        performSearch({
          multipleRecordPickerInstanceId: componentInstanceId,
          forceSearchFilter: searchFilter,
          loadMore: true,
        });
      },
    [componentInstanceId, performSearch, searchFilter, isLoading],
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

  if (!paginationState.hasNextPage) {
    return null;
  }

  return (
    <div ref={ref}>{isLoading && <StyledText>Loading more...</StyledText>}</div>
  );
};
