import { styled } from '@linaria/react';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnPaddingAndBorderWidth';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';

const StyledFetchMoreTriggerDiv = styled.div<{ width: number }>`
  max-width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;
`;

const ESTIMATED_BOARD_CARD_HEIGHT_BASE = 60;
const ESTIMATED_BOARD_CARD_FIELD_ROW_HEIGHT = 28;

export const RecordBoardFetchMoreInViewTriggerComponent = () => {
  const [recordBoardShouldFetchMore, setRecordBoardShouldFetchMore] =
    useAtomComponentState(recordBoardShouldFetchMoreComponentState);

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const recordBoardIsFetchingMore = useAtomComponentStateValue(
    recordBoardIsFetchingMoreComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  // Scale detection zone with card height (driven by visible field count)
  // so the trigger fires before skeleton cards become visible to the user
  const rootMargin = useMemo(() => {
    const estimatedCardHeight =
      ESTIMATED_BOARD_CARD_HEIGHT_BASE +
      visibleRecordFields.length * ESTIMATED_BOARD_CARD_FIELD_ROW_HEIGHT;

    return `${estimatedCardHeight * RECORD_BOARD_QUERY_PAGE_SIZE * 2}px`;
  }, [visibleRecordFields.length]);

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { ref, inView } = useInView({
    rootMargin,
    root: scrollWrapperHTMLElement,
  });

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
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
