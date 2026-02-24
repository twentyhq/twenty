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
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';

import { useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RecordBoardQueryEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [lastRecordBoardQueryIdentifier, setLastRecordBoardQueryIdentifier] =
    useRecoilComponentStateV2(lastRecordBoardQueryIdentifierComponentState);

  const [lastRecordGroupIds, setLastRecordGroupIds] = useRecoilComponentStateV2(
    lastRecordGroupIdsComponentState,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useRecoilComponentValueV2(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const setRecordBoardCurrentGroupByQueryOffset = useSetRecoilComponentStateV2(
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

  const [shouldFetchMore] = useRecoilComponentStateV2(
    recordBoardShouldFetchMoreComponentState,
  );

  const recordBoardIsFetchingMore = useRecoilComponentValueV2(
    recordBoardIsFetchingMoreComponentState,
  );

  const { triggerRecordBoardFetchMore } = useTriggerRecordBoardFetchMore();

  const { triggerRecordBoardInitialQuery } =
    useTriggerRecordBoardInitialQuery();

  const recordGroupdIds = useRecoilComponentValueV2(
    recordGroupIdsComponentState,
  );
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
