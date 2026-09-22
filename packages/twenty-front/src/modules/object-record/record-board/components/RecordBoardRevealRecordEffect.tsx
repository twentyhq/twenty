import { useContext, useEffect } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardQueryIdentifier } from '@/object-record/record-board/hooks/useRecordBoardQueryIdentifier';
import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexRecordToRevealComponentState } from '@/object-record/record-index/states/recordIndexRecordToRevealComponentState';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export const RecordBoardRevealRecordEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const [recordIndexRecordToReveal, setRecordIndexRecordToReveal] =
    useAtomComponentState(recordIndexRecordToRevealComponentState);

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const recordBoardIsFetchingMore = useAtomComponentStateValue(
    recordBoardIsFetchingMoreComponentState,
  );

  const lastRecordBoardQueryIdentifier = useAtomComponentStateValue(
    lastRecordBoardQueryIdentifierComponentState,
  );

  const queryIdentifier = useRecordBoardQueryIdentifier();

  const visibleRecordGroupIds = useAtomComponentFamilySelectorValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.KANBAN,
  );

  const targetRecordGroupId = recordIndexRecordToReveal?.recordGroupId ?? '';

  const recordIndexRecordIdsByGroup = useAtomComponentFamilyStateValue(
    recordIndexRecordIdsByGroupComponentFamilyState,
    targetRecordGroupId,
  );

  const recordBoardShouldFetchMoreInColumn = useAtomComponentFamilyStateValue(
    recordBoardShouldFetchMoreInColumnComponentFamilyState,
    targetRecordGroupId,
  );

  const { focusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const { triggerRecordBoardFetchMore } = useTriggerRecordBoardFetchMore();

  useEffect(() => {
    // Fetching more before the initial query has run for the current filters
    // would append a second page onto an empty board.
    const isBoardLoadedForCurrentQuery =
      queryIdentifier === lastRecordBoardQueryIdentifier;

    if (
      !isDefined(recordIndexRecordToReveal) ||
      !isBoardLoadedForCurrentQuery ||
      recordIndexRecordGroupsAreInInitialLoading ||
      recordBoardIsFetchingMore
    ) {
      return;
    }

    const columnIndex = visibleRecordGroupIds.indexOf(
      recordIndexRecordToReveal.recordGroupId,
    );

    if (columnIndex === -1) {
      setRecordIndexRecordToReveal(null);

      return;
    }

    const rowIndex = recordIndexRecordIdsByGroup.indexOf(
      recordIndexRecordToReveal.recordId,
    );

    if (rowIndex !== -1) {
      setRecordIndexRecordToReveal(null);
      focusBoardCard({ columnIndex, rowIndex });

      return;
    }

    const isRecordBeyondLoadedPages =
      recordIndexRecordIdsByGroup.length <=
      recordIndexRecordToReveal.positionInGroup;

    if (isRecordBeyondLoadedPages && recordBoardShouldFetchMoreInColumn) {
      triggerRecordBoardFetchMore();

      return;
    }

    setRecordIndexRecordToReveal(null);
  }, [
    recordIndexRecordToReveal,
    setRecordIndexRecordToReveal,
    queryIdentifier,
    lastRecordBoardQueryIdentifier,
    recordIndexRecordGroupsAreInInitialLoading,
    recordBoardIsFetchingMore,
    visibleRecordGroupIds,
    recordIndexRecordIdsByGroup,
    recordBoardShouldFetchMoreInColumn,
    focusBoardCard,
    triggerRecordBoardFetchMore,
  ]);

  return null;
};
