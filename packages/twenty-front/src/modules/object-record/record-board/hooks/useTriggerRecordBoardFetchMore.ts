import { useCallback } from 'react';
import { useStore } from 'jotai';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RECORD_BOARD_FETCH_MORE_THROTTLING_WAIT_TIME_IN_MILLISECONDS_TO_AVOID_REACT_FREEZE } from '@/object-record/record-board/constants/RecordBoardFetchMoreThrottlingWaitTimeInMillisecondsToAvoidReactFreeze';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';

import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardIsFetchingMoreComponentState } from '@/object-record/record-board/states/recordBoardIsFetchingMoreComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { sleep } from '~/utils/sleep';

export const useTriggerRecordBoardFetchMore = () => {
  const store = useStore();
  const recordGroupDefinitions = useRecoilComponentSelectorValueV2(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordBoardShouldFetchMoreInColumnFamilyCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordBoardShouldFetchMoreInColumnComponentFamilyState,
    );

  const { combinedFilters } = useRecordIndexGroupCommonQueryVariables();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordBoardCurrentGroupByQueryOffsetCallbackState =
    useRecoilComponentStateCallbackStateV2(
      recordBoardCurrentGroupByQueryOffsetComponentState,
    );

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
    });

  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordBoardIsFetchingMore = useRecoilComponentStateCallbackStateV2(
    recordBoardIsFetchingMoreComponentState,
  );

  const triggerRecordBoardFetchMore = useCallback(async () => {
    const isAlreadyFetchingMore = store.get(recordBoardIsFetchingMore);

    const cleanStateBeforeExit = () => {
      store.set(recordBoardIsFetchingMore, false);
    };

    if (isAlreadyFetchingMore) {
      return;
    }

    store.set(recordBoardIsFetchingMore, true);

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
      .map((recordGroupDefinition) => recordGroupDefinition.value)
      .filter(isDefined);

    if (!isNonEmptyArray(recordGroupValuesThatShouldBeFetched)) {
      cleanStateBeforeExit();

      return;
    }

    const recordIndexGroupsRecordsGroupByLazyQueryResult =
      await executeRecordIndexGroupsRecordsLazyGroupBy({
        variables: {
          offsetForRecords: newOffset,
          filter: {
            ...combinedFilters,
            [recordIndexGroupFieldMetadataItem?.name ?? '']: {
              in: [...recordGroupValuesThatShouldBeFetched],
            },
          },
        },
      });

    store.set(recordBoardCurrentGroupByQueryOffsetCallbackState, newOffset);

    if (!isDefined(recordIndexGroupsRecordsGroupByLazyQueryResult)) {
      cleanStateBeforeExit();

      return;
    }

    const queryFieldName =
      getGroupByQueryResultGqlFieldName(objectMetadataItem);

    const groups =
      recordIndexGroupsRecordsGroupByLazyQueryResult.data?.[queryFieldName];

    if (!isDefined(groups)) {
      cleanStateBeforeExit();

      return;
    }

    const sortedRecordGroupDefinitions = recordGroupDefinitions.toSorted(
      sortByProperty('position'),
    );

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

      const newRecordIds = currentRecordIds.concat(
        newRecords.map((record) => record.id),
      );

      store.set(
        recordIndexRecordIdsByGroupCallbackState(recordGroupDefinition.id),
        newRecordIds,
      );

      upsertRecordsInStore({ partialRecords: newRecords });

      if (newRecords.length < RECORD_BOARD_QUERY_PAGE_SIZE) {
        store.set(
          recordBoardShouldFetchMoreInColumnFamilyCallbackState(
            recordGroupDefinition.id,
          ),
          false,
        );
      } else {
        store.set(
          recordBoardShouldFetchMoreInColumnFamilyCallbackState(
            recordGroupDefinition.id,
          ),
          true,
        );
      }

      await sleep(
        RECORD_BOARD_FETCH_MORE_THROTTLING_WAIT_TIME_IN_MILLISECONDS_TO_AVOID_REACT_FREEZE,
      );
    }

    cleanStateBeforeExit();
  }, [
    store,
    objectMetadataItem,
    recordGroupDefinitions,
    upsertRecordsInStore,
    executeRecordIndexGroupsRecordsLazyGroupBy,
    recordIndexRecordIdsByGroupCallbackState,
    recordBoardIsFetchingMore,
    recordBoardCurrentGroupByQueryOffsetCallbackState,
    recordBoardShouldFetchMoreInColumnFamilyCallbackState,
    combinedFilters,
    recordIndexGroupFieldMetadataItem,
  ]);

  return {
    triggerRecordBoardFetchMore,
  };
};
