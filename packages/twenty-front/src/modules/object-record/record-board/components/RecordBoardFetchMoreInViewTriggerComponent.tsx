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
import { useRecoilComponentFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorValueV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';

const StyledFetchMoreTriggerDiv = styled.div<{ width: number }>`
  max-width: ${({ width }) => width}px;
  min-width: ${({ width }) => width}px;
`;

export const RecordBoardFetchMoreInViewTriggerComponent = () => {
  const [shouldFetchMore, setShouldFetchMore] = useRecoilComponentStateV2(
    recordBoardShouldFetchMoreComponentState,
  );

  const isInitialLoading = useRecoilComponentValueV2(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const isFetchingMore = useRecoilComponentValueV2(
    recordBoardIsFetchingMoreComponentState,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { ref, inView } = useInView({
    rootMargin: '1600px',
    root: scrollWrapperHTMLElement,
  });

  const visibleRecordGroupIds = useRecoilComponentFamilySelectorValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const componentWidth =
    visibleRecordGroupIds.length * RECORD_BOARD_COLUMN_WIDTH +
    visibleRecordGroupIds.length *
      RECORD_BOARD_COLUMN_PADDING_AND_BORDER_WIDTH -
    1;

  useEffect(() => {
    if (!isInitialLoading && !isFetchingMore) {
      const newShouldFetchMore = inView;

      if (shouldFetchMore !== newShouldFetchMore) {
        setShouldFetchMore(newShouldFetchMore);
      }
    }
  }, [
    shouldFetchMore,
    setShouldFetchMore,
    inView,
    isInitialLoading,
    isFetchingMore,
  ]);

  return (
    <StyledFetchMoreTriggerDiv
      width={componentWidth}
      ref={ref}
    ></StyledFetchMoreTriggerDiv>
  );
};
