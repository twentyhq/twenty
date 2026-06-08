import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { lastRecordGroupIdsComponentState } from '@/object-record/record-board/states/lastRecordGroupIdsComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';

import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

import { useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RecordBoardQueryEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const [lastRecordBoardQueryIdentifier, setLastRecordBoardQueryIdentifier] =
    useAtomComponentState(lastRecordBoardQueryIdentifierComponentState);

  const [lastRecordGroupIds, setLastRecordGroupIds] = useAtomComponentState(
    lastRecordGroupIdsComponentState,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const setRecordBoardCurrentGroupByQueryOffset = useSetAtomComponentState(
    recordBoardCurrentGroupByQueryOffsetComponentState,
  );

  const { combinedFilters, orderBy } =
    useRecordIndexGroupCommonQueryVariables();

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: combinedFilters,
    orderBy,
  });

  const queryIdentifierHasChanged =
    queryIdentifier !== lastRecordBoardQueryIdentifier;

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const recordBoardShouldFetchMore = useAtomComponentStateValue(
    recordBoardShouldFetchMoreComponentState,
  );

  const setRecordBoardShouldFetchMore = useSetAtomComponentState(
    recordBoardShouldFetchMoreComponentState,
  );

  const { triggerRecordBoardFetchMore } = useTriggerRecordBoardFetchMore();

  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();

  const recordGroupIds = useAtomComponentStateValue(
    recordGroupIdsComponentState,
  );
  const recordGroupIdsHaveChanged = !isDeeplyEqual(
    [...recordGroupIds].sort(),
    [...lastRecordGroupIds].sort(),
  );

  useEffect(() => {
    if (isDraggingRecord) {
      return;
    }

    if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      (queryIdentifierHasChanged || recordGroupIdsHaveChanged)
    ) {
      triggerRecordBoardInitialQuery();
      setLastRecordGroupIds(recordGroupIds);
    } else if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      recordBoardShouldFetchMore &&
      !queryIdentifierHasChanged
    ) {
      // `recordBoardShouldFetchMore` latches true once the sentinel is in view
      // (its rootMargin spans ~2 pages), and this effect only re-runs on the
      // false->true edge. Reset it to false after each page that actually
      // loaded records so the still-in-view observer re-asserts true and paging
      // continues; it stops when the sentinel leaves view or a page returns no
      // records (didFetchRecords === false).
      triggerRecordBoardFetchMore().then((didFetchRecords) => {
        if (didFetchRecords) {
          setRecordBoardShouldFetchMore(false);
        }
      });
    }
  }, [
    triggerRecordBoardInitialQuery,
    queryIdentifierHasChanged,
    setLastRecordBoardQueryIdentifier,
    queryIdentifier,
    setRecordBoardCurrentGroupByQueryOffset,
    scrollWrapperHTMLElement,
    recordIndexRecordGroupsAreInInitialLoading,
    recordBoardShouldFetchMore,
    setRecordBoardShouldFetchMore,
    triggerRecordBoardFetchMore,
    setLastRecordGroupIds,
    recordGroupIds,
    recordGroupIdsHaveChanged,
    isDraggingRecord,
  ]);

  return null;
};
