import { useStore } from 'jotai';
import { startTransition, useCallback } from 'react';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RECORD_BOARD_FETCH_MORE_RETRY_BASE_DELAY_IN_MILLISECONDS } from '@/object-record/record-board/constants/RecordBoardFetchMoreRetryBaseDelayInMilliseconds';
import { RECORD_BOARD_FETCH_MORE_RETRY_MAX_DELAY_IN_MILLISECONDS } from '@/object-record/record-board/constants/RecordBoardFetchMoreRetryMaxDelayInMilliseconds';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';

import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardFetchMoreFailureCountComponentState } from '@/object-record/record-board/states/recordBoardFetchMoreFailureCountComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardQueryGenerationComponentState } from '@/object-record/record-board/states/recordBoardQueryGenerationComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const useTriggerRecordBoardFetchMore = () => {
  const store = useStore();
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordBoardShouldFetchMoreInColumnFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordBoardShouldFetchMoreInColumnComponentFamilyState,
    );

  const { combinedFilters } = useRecordIndexGroupCommonQueryVariables();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordBoardCurrentGroupByQueryOffsetCallbackState =
    useAtomComponentStateCallbackState(
      recordBoardCurrentGroupByQueryOffsetComponentState,
    );

  const recordBoardQueryGenerationCallbackState =
    useAtomComponentStateCallbackState(
      recordBoardQueryGenerationComponentState,
    );

  const recordBoardFetchMoreFailureCountCallbackState =
    useAtomComponentStateCallbackState(
      recordBoardFetchMoreFailureCountComponentState,
    );

  const recordIndexRecordGroupsAreInInitialLoadingCallbackState =
    useAtomComponentStateCallbackState(
      recordIndexRecordGroupsAreInInitialLoadingComponentState,
    );

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
    });

  const recordIndexRecordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordBoardIsFetchingMore = useAtomComponentStateCallbackState(
    recordBoardIsFetchingMoreComponentState,
  );

  // Ends early when an initial query starts, so a reset is never stuck behind a backoff
  const waitForRetryDelayOrReset = useCallback(
    (delayInMilliseconds: number) =>
      new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        };
        const timeout = setTimeout(finish, delayInMilliseconds);
        const unsubscribe = store.sub(
          recordBoardQueryGenerationCallbackState,
          finish,
        );
      }),
    [store, recordBoardQueryGenerationCallbackState],
  );

  const triggerRecordBoardFetchMore = useCallback(async () => {
    if (
      store.get(recordBoardIsFetchingMore) ||
      store.get(recordIndexRecordGroupsAreInInitialLoadingCallbackState)
    ) {
      return;
    }

    store.set(recordBoardIsFetchingMore, true);

    try {
      const currentOffset = store.get(
        recordBoardCurrentGroupByQueryOffsetCallbackState,
      );

      const newOffset = currentOffset + RECORD_BOARD_QUERY_PAGE_SIZE;

      const recordGroupValuesThatShouldBeFetched = recordGroupDefinitions
        .filter((recordGroupDefinition) => {
          return store.get(
            recordBoardShouldFetchMoreInColumnFamilyCallbackState(
              recordGroupDefinition.id,
            ),
          );
        })
        .map((recordGroupDefinition) => recordGroupDefinition.value);

      if (!isNonEmptyArray(recordGroupValuesThatShouldBeFetched)) {
        return;
      }

      const recordGroupOptionsFilter = computeRecordGroupOptionsFilter({
        recordGroupFieldMetadata: recordIndexGroupFieldMetadataItem,
        recordGroupValues: recordGroupValuesThatShouldBeFetched,
      });

      const queryGenerationAtRequest = store.get(
        recordBoardQueryGenerationCallbackState,
      );

      const recordIndexGroupsRecordsGroupByLazyQueryResult =
        await executeRecordIndexGroupsRecordsLazyGroupBy({
          variables: {
            offsetForRecords: newOffset,
            filter: {
              ...combinedFilters,
              ...recordGroupOptionsFilter,
            },
          },
        }).catch(() => null);

      if (
        store.get(recordBoardQueryGenerationCallbackState) !==
        queryGenerationAtRequest
      ) {
        return;
      }

      if (!isDefined(recordIndexGroupsRecordsGroupByLazyQueryResult)) {
        const failureCount =
          store.get(recordBoardFetchMoreFailureCountCallbackState) + 1;

        store.set(recordBoardFetchMoreFailureCountCallbackState, failureCount);

        await waitForRetryDelayOrReset(
          Math.min(
            RECORD_BOARD_FETCH_MORE_RETRY_MAX_DELAY_IN_MILLISECONDS,
            RECORD_BOARD_FETCH_MORE_RETRY_BASE_DELAY_IN_MILLISECONDS *
              2 ** (failureCount - 1),
          ),
        );

        return;
      }

      store.set(recordBoardFetchMoreFailureCountCallbackState, 0);
      store.set(recordBoardCurrentGroupByQueryOffsetCallbackState, newOffset);

      const queryFieldName =
        getGroupByQueryResultGqlFieldName(objectMetadataItem);

      const groups =
        recordIndexGroupsRecordsGroupByLazyQueryResult.data?.[queryFieldName];

      if (!isDefined(groups)) {
        return;
      }

      const sortedRecordGroupDefinitions = recordGroupDefinitions.toSorted(
        sortByProperty('position'),
      );

      // One transition keeps the pointer responsive while every column mounts its new cards
      startTransition(() => {
        for (const recordGroupDefinition of sortedRecordGroupDefinitions) {
          const foundGroupInResult = groups.find(
            (recordGroup: any) =>
              (recordGroup.groupByDimensionValues[0] as string) ===
              recordGroupDefinition.value,
          );

          if (!isDefined(foundGroupInResult)) {
            store.set(
              recordBoardShouldFetchMoreInColumnFamilyCallbackState(
                recordGroupDefinition.id,
              ),
              false,
            );
            continue;
          }

          const newRecords = getRecordsFromRecordConnection({
            recordConnection: foundGroupInResult,
          });

          if (!isNonEmptyArray(newRecords)) {
            store.set(
              recordBoardShouldFetchMoreInColumnFamilyCallbackState(
                recordGroupDefinition.id,
              ),
              false,
            );
            continue;
          }

          const currentRecordIds = store.get(
            recordIndexRecordIdsByGroupCallbackState(recordGroupDefinition.id),
          ) as string[];

          // Offset pages re-rank server-side, so a card moved locally can come back on a later page
          const newRecordIds = Array.from(
            new Set([
              ...currentRecordIds,
              ...newRecords.map((record) => record.id),
            ]),
          );

          store.set(
            recordIndexRecordIdsByGroupCallbackState(recordGroupDefinition.id),
            newRecordIds,
          );

          upsertRecordsInStore({ partialRecords: newRecords });

          store.set(
            recordBoardShouldFetchMoreInColumnFamilyCallbackState(
              recordGroupDefinition.id,
            ),
            newRecords.length >= RECORD_BOARD_QUERY_PAGE_SIZE,
          );
        }
      });
    } finally {
      store.set(recordBoardIsFetchingMore, false);
    }
  }, [
    store,
    objectMetadataItem,
    recordGroupDefinitions,
    upsertRecordsInStore,
    executeRecordIndexGroupsRecordsLazyGroupBy,
    recordIndexRecordIdsByGroupCallbackState,
    recordBoardIsFetchingMore,
    recordBoardCurrentGroupByQueryOffsetCallbackState,
    recordBoardQueryGenerationCallbackState,
    recordBoardFetchMoreFailureCountCallbackState,
    recordIndexRecordGroupsAreInInitialLoadingCallbackState,
    recordBoardShouldFetchMoreInColumnFamilyCallbackState,
    waitForRetryDelayOrReset,
    combinedFilters,
    recordIndexGroupFieldMetadataItem,
  ]);

  return {
    triggerRecordBoardFetchMore,
  };
};
