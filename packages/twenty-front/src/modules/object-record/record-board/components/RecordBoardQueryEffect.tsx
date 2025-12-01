import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreComponentState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';

import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

import { useEffect } from 'react';

export const RecordBoardQueryEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [lastRecordBoardQueryIdentifier, setLastRecordBoardQueryIdentifier] =
    useRecoilComponentState(lastRecordBoardQueryIdentifierComponentState);

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

  useEffect(() => {
    if (
      !recordIndexRecordGroupsAreInInitialLoading &&
      queryIdentifierHasChanged
    ) {
      triggerRecordBoardInitialQuery();
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
  ]);

  return null;
};
