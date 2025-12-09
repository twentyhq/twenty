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
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RecordBoardQueryEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [lastRecordBoardQueryIdentifier, setLastRecordBoardQueryIdentifier] =
    useRecoilComponentState(lastRecordBoardQueryIdentifierComponentState);

  const [lastRecordGroupIds, setLastRecordGroupIds] = useRecoilComponentState(
    lastRecordGroupIdsComponentState,
  );

  const [recordIndexRecordGroupsAreInInitialLoading] = useRecoilComponentState(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const setRecordBoardCurrentGroupByQueryOffset = useSetRecoilComponentState(
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

  const [shouldFetchMore] = useRecoilComponentState(
    recordBoardShouldFetchMoreComponentState,
  );

  const recordBoardIsFetchingMore = useRecoilComponentValue(
    recordBoardIsFetchingMoreComponentState,
  );

  const { triggerRecordBoardFetchMore } = useTriggerRecordBoardFetchMore();

  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();

  const recordGroupdIds = useRecoilComponentValue(recordGroupIdsComponentState);
  const recordGroupIdsHaveChanged = !isDeeplyEqual(
    [...recordGroupdIds].sort(),
    [...lastRecordGroupIds].sort(),
  );

  useEffect(() => {
    if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      (queryIdentifierHasChanged || recordGroupIdsHaveChanged)
    ) {
      triggerRecordBoardInitialQuery();
      setLastRecordGroupIds(recordGroupdIds);
    } else if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      shouldFetchMore &&
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
    shouldFetchMore,
    recordBoardIsFetchingMore,
    triggerRecordBoardFetchMore,
    setLastRecordGroupIds,
    recordGroupdIds,
    recordGroupIdsHaveChanged,
  ]);

  return null;
};
