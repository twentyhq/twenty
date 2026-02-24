import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useRecoilComponentSelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { isNonEmptyArray } from '@sniptt/guards';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useTriggerRecordBoardInitialQuery = () => {
  const recordGroupDefinitions = useRecoilComponentSelectorValueV2(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValueV2(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const setLastRecordBoardQueryIdentifier = useSetRecoilComponentStateV2(
    lastRecordBoardQueryIdentifierComponentState,
  );

  const recordBoardShouldFetchMoreInColumnFamilyCallbackState =
    useRecoilComponentFamilyStateCallbackStateV2(
      recordBoardShouldFetchMoreInColumnComponentFamilyState,
    );

  const recordIndexRecordGroupsAreInInitialLoading =
    useRecoilComponentStateCallbackStateV2(
      recordIndexRecordGroupsAreInInitialLoadingComponentState,
    );

  const store = useStore();

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

  const { setRecordIdsForColumn } = useSetRecordIdsForColumn();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const { executeRecordIndexGroupsRecordsLazyGroupBy } =
    useRecordIndexGroupsRecordsLazyGroupBy({
      groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
      objectMetadataItem,
    });

  const triggerRecordBoardInitialQuery = useCallback(async () => {
    store.set(recordIndexRecordGroupsAreInInitialLoading, true);

    const cleanStateBeforeExit = () => {
      store.set(recordIndexRecordGroupsAreInInitialLoading, false);

      setLastRecordBoardQueryIdentifier(queryIdentifier);

      setRecordBoardCurrentGroupByQueryOffset(0);

      scrollWrapperHTMLElement?.scrollTo({ top: 0, left: 0 });
    };

    const recordIndexGroupsRecordsGroupByLazyQueryResult =
      await executeRecordIndexGroupsRecordsLazyGroupBy();

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

    for (const recordGroupDefinition of recordGroupDefinitions) {
      const foundGroupInResult = groups?.find(
        (recordGroup: any) =>
          (recordGroup.groupByDimensionValues[0] as string) ===
          recordGroupDefinition.value,
      );

      if (!isDefined(foundGroupInResult)) {
        setRecordIdsForColumn(recordGroupDefinition.id, []);
        store.set(
          recordBoardShouldFetchMoreInColumnFamilyCallbackState(
            recordGroupDefinition.id,
          ),
          false,
        );
        continue;
      }

      const records = getRecordsFromRecordConnection({
        recordConnection: foundGroupInResult,
      });

      if (!isNonEmptyArray(records)) {
        setRecordIdsForColumn(recordGroupDefinition.id, []);
        store.set(
          recordBoardShouldFetchMoreInColumnFamilyCallbackState(
            recordGroupDefinition.id,
          ),
          false,
        );
        continue;
      }

      upsertRecordsInStore({ partialRecords: records });

      setRecordIdsForColumn(recordGroupDefinition.id, records);

      if (records.length < RECORD_BOARD_QUERY_PAGE_SIZE) {
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
    }

    cleanStateBeforeExit();
  }, [
    recordIndexRecordGroupsAreInInitialLoading,
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
  ]);

  return {
    triggerRecordBoardInitialQuery,
  };
};
