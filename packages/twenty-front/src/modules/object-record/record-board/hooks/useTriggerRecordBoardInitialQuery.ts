import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { useRecordBoardQueryIdentifier } from '@/object-record/record-board/hooks/useRecordBoardQueryIdentifier';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardQueryGenerationComponentState } from '@/object-record/record-board/states/recordBoardQueryGenerationComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { combineFilters, isDefined } from 'twenty-shared/utils';

export const useTriggerRecordBoardInitialQuery = () => {
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const setLastRecordBoardQueryIdentifier = useSetAtomComponentState(
    lastRecordBoardQueryIdentifierComponentState,
  );

  const recordBoardShouldFetchMoreInColumnFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordBoardShouldFetchMoreInColumnComponentFamilyState,
    );

  const recordIndexRecordGroupsAreInInitialLoading =
    useAtomComponentStateCallbackState(
      recordIndexRecordGroupsAreInInitialLoadingComponentState,
    );

  const recordBoardQueryGeneration = useAtomComponentStateCallbackState(
    recordBoardQueryGenerationComponentState,
  );

  const store = useStore();

  const setRecordBoardCurrentGroupByQueryOffset = useSetAtomComponentState(
    recordBoardCurrentGroupByQueryOffsetComponentState,
  );

  const queryIdentifier = useRecordBoardQueryIdentifier();
  const { combinedFilters } = useRecordIndexGroupCommonQueryVariables();

  const { setRecordIdsForColumn } = useSetRecordIdsForColumn();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
    });

  const triggerRecordBoardInitialQuery = useCallback(
    async ({
      shouldResetScroll,
      recordGroupId,
    }: {
      shouldResetScroll: boolean;
      recordGroupId?: string;
    }) => {
      const queryGeneration = store.get(recordBoardQueryGeneration) + 1;

      store.set(recordBoardQueryGeneration, queryGeneration);
      store.set(recordIndexRecordGroupsAreInInitialLoading, true);

      const queryIsCurrent = () =>
        store.get(recordBoardQueryGeneration) === queryGeneration;

      const targetRecordGroup = isDefined(recordGroupId)
        ? recordGroupDefinitions.find(
            (recordGroupDefinition) =>
              recordGroupDefinition.id === recordGroupId,
          )
        : undefined;

      if (isDefined(recordGroupId) && !isDefined(targetRecordGroup)) {
        store.set(recordIndexRecordGroupsAreInInitialLoading, false);
        return;
      }

      const cleanStateBeforeExit = () => {
        store.set(recordIndexRecordGroupsAreInInitialLoading, false);

        setLastRecordBoardQueryIdentifier(queryIdentifier);

        if (!isDefined(targetRecordGroup)) {
          setRecordBoardCurrentGroupByQueryOffset(0);
        }

        if (shouldResetScroll) {
          scrollWrapperHTMLElement?.scrollTo({ top: 0, left: 0 });
        }
      };

      const queryFieldName =
        getGroupByQueryResultGqlFieldName(objectMetadataItem);

      const recordGroupsToUpdate = isDefined(targetRecordGroup)
        ? [targetRecordGroup]
        : recordGroupDefinitions;
      const recordsByGroupId = new Map<string, ObjectRecord[]>();
      const lastPageSizeByGroupId = new Map<string, number>();
      const recordGroupOptionsFilter = isDefined(targetRecordGroup)
        ? computeRecordGroupOptionsFilter({
            recordGroupFieldMetadata: recordIndexGroupFieldMetadataItem,
            recordGroupValues: [targetRecordGroup.value],
          })
        : {};

      let offsetForRecords = 0;

      while (true) {
        const queryResult = await executeRecordIndexGroupsRecordsLazyGroupBy(
          isDefined(targetRecordGroup)
            ? {
                variables: {
                  filter: combineFilters([
                    combinedFilters,
                    recordGroupOptionsFilter,
                  ]),
                  offsetForRecords,
                  limit: 1,
                },
              }
            : undefined,
        );

        if (!queryIsCurrent()) {
          return;
        }

        const groups = queryResult?.data?.[queryFieldName];

        if (!isDefined(groups)) {
          cleanStateBeforeExit();
          return;
        }

        for (const recordGroupDefinition of recordGroupsToUpdate) {
          const foundGroupInResult = groups.find(
            (recordGroup) =>
              recordGroup.groupByDimensionValues[0] ===
              recordGroupDefinition.value,
          );
          const records = isDefined(foundGroupInResult)
            ? getRecordsFromRecordConnection({
                recordConnection: foundGroupInResult,
              })
            : [];

          recordsByGroupId.set(recordGroupDefinition.id, [
            ...(recordsByGroupId.get(recordGroupDefinition.id) ?? []),
            ...records,
          ]);
          lastPageSizeByGroupId.set(recordGroupDefinition.id, records.length);
        }

        if (
          !isDefined(targetRecordGroup) ||
          (lastPageSizeByGroupId.get(targetRecordGroup.id) ?? 0) <
            RECORD_BOARD_QUERY_PAGE_SIZE
        ) {
          break;
        }

        offsetForRecords += RECORD_BOARD_QUERY_PAGE_SIZE;
      }

      for (const recordGroupDefinition of recordGroupsToUpdate) {
        const records = recordsByGroupId.get(recordGroupDefinition.id) ?? [];

        if (records.length > 0) {
          upsertRecordsInStore({ partialRecords: records });
        }

        setRecordIdsForColumn(recordGroupDefinition.id, records);
        store.set(
          recordBoardShouldFetchMoreInColumnFamilyCallbackState(
            recordGroupDefinition.id,
          ),
          (lastPageSizeByGroupId.get(recordGroupDefinition.id) ?? 0) >=
            RECORD_BOARD_QUERY_PAGE_SIZE,
        );
      }

      cleanStateBeforeExit();
    },
    [
      recordIndexRecordGroupsAreInInitialLoading,
      recordBoardQueryGeneration,
      store,
      executeRecordIndexGroupsRecordsLazyGroupBy,
      objectMetadataItem,
      setLastRecordBoardQueryIdentifier,
      queryIdentifier,
      setRecordBoardCurrentGroupByQueryOffset,
      scrollWrapperHTMLElement,
      recordGroupDefinitions,
      upsertRecordsInStore,
      setRecordIdsForColumn,
      recordBoardShouldFetchMoreInColumnFamilyCallbackState,
      recordIndexGroupFieldMetadataItem,
      combinedFilters,
    ],
  );

  return {
    triggerRecordBoardInitialQuery,
  };
};
