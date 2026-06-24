import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { mergeRelationRecordGroupDefinitions } from '@/object-record/record-group/utils/mergeRelationRecordGroupDefinitions';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { useRecordIndexGroupsRecordsLazyGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { isNonEmptyArray } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useTriggerRecordBoardInitialQuery = () => {
  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { setRecordGroups } = useSetRecordGroups();

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

  const store = useStore();

  const setRecordBoardCurrentGroupByQueryOffset = useSetAtomComponentState(
    recordBoardCurrentGroupByQueryOffsetComponentState,
  );

  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const { getViewFromState } = useGetViewFromState();

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

  const triggerRecordBoardInitialQuery = useCallback(
    async ({ shouldResetScroll }: { shouldResetScroll: boolean }) => {
      store.set(recordIndexRecordGroupsAreInInitialLoading, true);

      const cleanStateBeforeExit = () => {
        store.set(recordIndexRecordGroupsAreInInitialLoading, false);

        setLastRecordBoardQueryIdentifier(queryIdentifier);

        setRecordBoardCurrentGroupByQueryOffset(0);

        if (shouldResetScroll) {
          scrollWrapperHTMLElement?.scrollTo({ top: 0, left: 0 });
        }
      };

      const recordIndexGroupsRecordsGroupByLazyQueryResult =
        await executeRecordIndexGroupsRecordsLazyGroupBy().catch(() => null);

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

      let recordGroupDefinitionsToFill: RecordGroupDefinition[] =
        recordGroupDefinitions;

      if (
        isDefined(recordIndexGroupFieldMetadataItem) &&
        isManyToOneRelationField(recordIndexGroupFieldMetadataItem)
      ) {
        const targetObjectMetadataItem = objectMetadataItems.find(
          (item) =>
            item.id ===
            recordIndexGroupFieldMetadataItem.relation.targetObjectMetadata.id,
        );

        const currentViewId = store.get(currentViewIdCallbackState);
        const persistedViewGroups = isDefined(currentViewId)
          ? (getViewFromState(currentViewId)?.viewGroups ?? [])
          : [];

        recordGroupDefinitionsToFill = mergeRelationRecordGroupDefinitions({
          groups,
          relationFieldName: recordIndexGroupFieldMetadataItem.name,
          mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem.id,
          targetObjectMetadataItem,
          existingRecordGroupDefinitions: recordGroupDefinitions,
          persistedViewGroups,
        });

        setRecordGroups({
          mainGroupByFieldMetadataId: recordIndexGroupFieldMetadataItem.id,
          recordGroups: recordGroupDefinitionsToFill,
          recordIndexId,
          objectMetadataItemId: objectMetadataItem.id,
        });
      }

      for (const recordGroupDefinition of recordGroupDefinitionsToFill) {
        const foundGroupInResult = groups?.find(
          (recordGroup) =>
            recordGroup.groupByDimensionValues[0] ===
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
    },
    [
      recordIndexRecordGroupsAreInInitialLoading,
      store,
      executeRecordIndexGroupsRecordsLazyGroupBy,
      objectMetadataItem,
      setLastRecordBoardQueryIdentifier,
      queryIdentifier,
      setRecordBoardCurrentGroupByQueryOffset,
      scrollWrapperHTMLElement,
      recordGroupDefinitions,
      recordIndexGroupFieldMetadataItem,
      objectMetadataItems,
      currentViewIdCallbackState,
      getViewFromState,
      setRecordGroups,
      recordIndexId,
      upsertRecordsInStore,
      setRecordIdsForColumn,
      recordBoardShouldFetchMoreInColumnFamilyCallbackState,
    ],
  );

  return {
    triggerRecordBoardInitialQuery,
  };
};
