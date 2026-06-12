import { styled } from '@linaria/react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnPaddingAndBorderWidth';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
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

// RecordCardHeaderContainer: height (24px) + padding top spacing(2) + padding bottom spacing(1)
const BOARD_CARD_HEADER_HEIGHT = 24 + 8 + 4;

// Per field row: skeleton height + RecordCardBodyContainer padding-bottom spacing(2) + StyledBodyContainer gap spacing(0.5)
const BOARD_CARD_FIELD_ROW_HEIGHT =
  SKELETON_LOADER_HEIGHT_SIZES.standard.s + 8 + 2;

// StyledBodyContainer padding (4+4) + card border (2×1px) + StyledSkeletonCardContainer margin-bottom spacing(2)
const BOARD_CARD_CHROME_HEIGHT = 8 + 2 + 8;

export const RecordBoardFetchMoreInViewTriggerComponent = () => {
  const [recordBoardShouldFetchMore, setRecordBoardShouldFetchMore] =
    useAtomComponentState(recordBoardShouldFetchMoreComponentState);

  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const estimatedCardHeight =
    BOARD_CARD_HEADER_HEIGHT +
    visibleRecordFields.length * BOARD_CARD_FIELD_ROW_HEIGHT +
    BOARD_CARD_CHROME_HEIGHT;

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

  const componentWidth =
    visibleRecordGroupIds.length * RECORD_BOARD_COLUMN_WIDTH +
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
