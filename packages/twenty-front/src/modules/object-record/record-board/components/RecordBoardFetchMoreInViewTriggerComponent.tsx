import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnPaddingAndBorderWidth';
import { useEstimatedRecordBoardCardHeight } from '@/object-record/record-board/hooks/useEstimatedRecordBoardCardHeight';

import { recordIndexKanbanColumnWidthComponentState } from '@/object-record/record-index/states/recordIndexKanbanColumnWidthComponentState';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
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

  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const estimatedCardHeight = useEstimatedRecordBoardCardHeight();

  const rootMargin = `${estimatedCardHeight * RECORD_BOARD_QUERY_PAGE_SIZE * 2}px`;

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { ref, inView } = useInView({
    rootMargin,
    root: scrollWrapperHTMLElement,
  });

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  const recordIndexKanbanColumnWidth = useAtomComponentStateValue(
    recordIndexKanbanColumnWidthComponentState,
  );

  const componentWidth =
    visibleRecordGroupIds.length * recordIndexKanbanColumnWidth +
    visibleRecordGroupIds.length *
      RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH -
    1;

  useEffect(() => {
    if (recordIndexRecordGroupsAreInInitialLoading || isDraggingRecord) {
      return;
    }

    const newShouldFetchMore = inView;

    if (recordBoardShouldFetchMore !== newShouldFetchMore) {
      setRecordBoardShouldFetchMore(newShouldFetchMore);
    }
  }, [
    recordBoardShouldFetchMore,
    setRecordBoardShouldFetchMore,
    inView,
    recordIndexRecordGroupsAreInInitialLoading,
    isDraggingRecord,
  ]);

  return (
    <StyledFetchMoreTriggerDiv
      width={componentWidth}
      ref={ref}
    ></StyledFetchMoreTriggerDiv>
  );
};
