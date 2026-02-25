import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnPaddingAndBorderWidth';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';

const StyledFetchMoreTriggerDiv = styled.div<{ width: number }>`
  max-width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;
`;

export const RecordBoardFetchMoreInViewTriggerComponent = () => {
  const [recordBoardShouldFetchMore, setRecordBoardShouldFetchMore] =
    useAtomComponentState(recordBoardShouldFetchMoreComponentState);

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const recordBoardIsFetchingMore = useAtomComponentStateValue(
    recordBoardIsFetchingMoreComponentState,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { ref, inView } = useInView({
    rootMargin: '1600px',
    root: scrollWrapperHTMLElement,
  });

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const componentWidth =
    visibleRecordGroupIds.length * RECORD_BOARD_COLUMN_WIDTH +
    visibleRecordGroupIds.length *
      RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH -
    1;

  useEffect(() => {
    if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      !recordBoardIsFetchingMore
    ) {
      const newShouldFetchMore = inView;

      if (recordBoardShouldFetchMore !== newShouldFetchMore) {
        setRecordBoardShouldFetchMore(newShouldFetchMore);
      }
    }
  }, [
    recordBoardShouldFetchMore,
    setRecordBoardShouldFetchMore,
    inView,
    recordIndexRecordGroupsAreInInitialLoading,
    recordBoardIsFetchingMore,
  ]);

  return (
    <StyledFetchMoreTriggerDiv
      width={componentWidth}
      ref={ref}
    ></StyledFetchMoreTriggerDiv>
  );
};
