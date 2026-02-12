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
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { sleep } from '~/utils/sleep';

export const useTriggerRecordBoardFetchMore = () => {
  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordBoardShouldFetchMoreInColumnFamilyCallbackState =
    useRecoilComponentCallbackState(
      recordBoardShouldFetchMoreInColumnComponentFamilyState,
    );

  const { combinedFilters } = useRecordIndexGroupCommonQueryVariables();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const recordBoardCurrentGroupByQueryOffsetCallbackState =
    useRecoilComponentCallbackState(
      recordBoardCurrentGroupByQueryOffsetComponentState,
    );

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
    });

  const recordIndexRecordIdsByGroupCallbackState =
    useRecoilComponentCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const recordBoardIsFetchingMoreCallbackState =
    useRecoilComponentCallbackState(recordBoardIsFetchingMoreComponentState);

  const triggerRecordBoardFetchMore = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const isAlreadyFetchingMore = getSnapshotValue(
          snapshot,
          recordBoardIsFetchingMoreCallbackState,
        );

        const cleanStateBeforeExit = () => {
          set(recordBoardIsFetchingMoreCallbackState, false);
        };

        if (isAlreadyFetchingMore) {
          return;
        }

        set(recordBoardIsFetchingMoreCallbackState, true);

        const currentOffset = getSnapshotValue(
          snapshot,
          recordBoardCurrentGroupByQueryOffsetCallbackState,
        );

        const newOffset = currentOffset + RECORD_BOARD_QUERY_PAGE_SIZE;

        const recordGroupValuesThatShouldBeFetched = recordGroupDefinitions
          .filter((recordGroupDefinition) => {
            return getSnapshotValue(
              snapshot,
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

        set(recordBoardCurrentGroupByQueryOffsetCallbackState, newOffset);

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
            set(
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
            set(
              recordBoardShouldFetchMoreInColumnFamilyCallbackState(
                recordGroupDefinition.id,
              ),
              false,
            );
            continue;
          }

          const currentRecordIds = getSnapshotValue(
            snapshot,
            recordIndexRecordIdsByGroupCallbackState(recordGroupDefinition.id),
          );

          const newRecordIds = currentRecordIds.concat(
            newRecords.map((record) => record.id),
          );

          set(
            recordIndexRecordIdsByGroupCallbackState(recordGroupDefinition.id),
            newRecordIds,
          );

          upsertRecordsInStore({ partialRecords: newRecords });

          if (newRecords.length < RECORD_BOARD_QUERY_PAGE_SIZE) {
            set(
              recordBoardShouldFetchMoreInColumnFamilyCallbackState(
                recordGroupDefinition.id,
              ),
              false,
            );
          } else {
            set(
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
      },
    [
      objectMetadataItem,
      recordGroupDefinitions,
      upsertRecordsInStore,
      executeRecordIndexGroupsRecordsLazyGroupBy,
      recordIndexRecordIdsByGroupCallbackState,
      recordBoardIsFetchingMoreCallbackState,
      recordBoardCurrentGroupByQueryOffsetCallbackState,
      recordBoardShouldFetchMoreInColumnFamilyCallbackState,
      combinedFilters,
      recordIndexGroupFieldMetadataItem,
    ],
  );

  return {
    triggerRecordBoardFetchMore,
  };
};
