import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { lastRecordGroupIdsComponentState } from '@/object-record/record-board/states/lastRecordGroupIdsComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
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

  const [recordBoardShouldFetchMore] = useAtomComponentState(
    recordBoardShouldFetchMoreComponentState,
  );

  const recordBoardIsFetchingMore = useAtomComponentStateValue(
    recordBoardIsFetchingMoreComponentState,
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
    if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      (queryIdentifierHasChanged || recordGroupIdsHaveChanged)
    ) {
      triggerRecordBoardInitialQuery();
      setLastRecordGroupIds(recordGroupIds);
    } else if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      recordBoardShouldFetchMore &&
      !queryIdentifierHasChanged &&
      !recordBoardIsFetchingMore
    ) {
      triggerRecordBoardFetchMore();
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
    recordBoardIsFetchingMore,
    triggerRecordBoardFetchMore,
    setLastRecordGroupIds,
    recordGroupIds,
    recordGroupIdsHaveChanged,
  ]);

  return null;
};
