import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RECORD_BOARD_QUERY_PAGE_SIZE } from '@/object-record/record-board/constants/RecordBoardQueryPageSize';
import { useRecordBoardQueryIdentifier } from '@/object-record/record-board/hooks/useRecordBoardQueryIdentifier';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardGroupQueryGenerationComponentFamilyState } from '@/object-record/record-board/states/recordBoardGroupQueryGenerationComponentFamilyState';
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
  const recordBoardGroupQueryGenerationFamilyCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordBoardGroupQueryGenerationComponentFamilyState,
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
      const targetRecordGroup = isDefined(recordGroupId)
        ? recordGroupDefinitions.find(
            (recordGroupDefinition) =>
              recordGroupDefinition.id === recordGroupId,
          )
        : undefined;

      if (isDefined(recordGroupId) && !isDefined(targetRecordGroup)) {
        return;
      }

      const queryGeneration =
        store.get(recordBoardQueryGeneration) +
        (isDefined(targetRecordGroup) ? 0 : 1);

      if (!isDefined(targetRecordGroup)) {
        store.set(recordBoardQueryGeneration, queryGeneration);
        store.set(recordIndexRecordGroupsAreInInitialLoading, true);
      }

      const targetGroupGenerationAtom = isDefined(targetRecordGroup)
        ? recordBoardGroupQueryGenerationFamilyCallbackState(
            targetRecordGroup.id,
          )
        : undefined;
      const targetGroupGeneration = isDefined(targetGroupGenerationAtom)
        ? store.get(targetGroupGenerationAtom) + 1
        : undefined;

      if (
        isDefined(targetGroupGenerationAtom) &&
        isDefined(targetGroupGeneration)
      ) {
        store.set(targetGroupGenerationAtom, targetGroupGeneration);
      }

      const queryIsCurrent = () =>
        store.get(recordBoardQueryGeneration) === queryGeneration &&
        (!isDefined(targetGroupGenerationAtom) ||
          store.get(targetGroupGenerationAtom) === targetGroupGeneration);

      const cleanStateBeforeExit = () => {
        if (isDefined(targetRecordGroup)) {
          return;
        }

        store.set(recordIndexRecordGroupsAreInInitialLoading, false);

        setLastRecordBoardQueryIdentifier(queryIdentifier);
        setRecordBoardCurrentGroupByQueryOffset(0);

        if (shouldResetScroll) {
          scrollWrapperHTMLElement?.scrollTo({ top: 0, left: 0 });
        }
      };

      const queryFieldName =
        getGroupByQueryResultGqlFieldName(objectMetadataItem);

      const recordGroupsToUpdate = isDefined(targetRecordGroup)
        ? [targetRecordGroup]
        : recordGroupDefinitions;
      const groupGenerationsAtStart = new Map(
        recordGroupsToUpdate.map((recordGroupDefinition) => [
          recordGroupDefinition.id,
          store.get(
            recordBoardGroupQueryGenerationFamilyCallbackState(
              recordGroupDefinition.id,
            ),
          ),
        ]),
      );
      const recordsByGroupId = new Map<string, ObjectRecord[]>();
      const lastPageSizeByGroupId = new Map<string, number>();
      const totalCountByGroupId = new Map<string, number>();
      const recordGroupOptionsFilter = isDefined(targetRecordGroup)
        ? computeRecordGroupOptionsFilter({
            recordGroupFieldMetadata: recordIndexGroupFieldMetadataItem,
            recordGroupValues: [targetRecordGroup.value],
          })
        : {};

      let expectedTotalCount: number | undefined;

      for (
        let offsetForRecords = 0;
        !isDefined(expectedTotalCount) || offsetForRecords < expectedTotalCount;
        offsetForRecords += RECORD_BOARD_QUERY_PAGE_SIZE
      ) {
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
        ).catch(() => null);

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
          totalCountByGroupId.set(
            recordGroupDefinition.id,
            foundGroupInResult?.totalCount ?? 0,
          );
        }

        expectedTotalCount = isDefined(targetRecordGroup)
          ? (totalCountByGroupId.get(targetRecordGroup.id) ?? 0)
          : 0;

        if (
          !isDefined(targetRecordGroup) ||
          (lastPageSizeByGroupId.get(targetRecordGroup.id) ?? 0) === 0 ||
          offsetForRecords +
            (lastPageSizeByGroupId.get(targetRecordGroup.id) ?? 0) >=
            expectedTotalCount
        ) {
          break;
        }
      }

      for (const recordGroupDefinition of recordGroupsToUpdate) {
        if (
          store.get(
            recordBoardGroupQueryGenerationFamilyCallbackState(
              recordGroupDefinition.id,
            ),
          ) !== groupGenerationsAtStart.get(recordGroupDefinition.id)
        ) {
          continue;
        }

        const records = recordsByGroupId.get(recordGroupDefinition.id) ?? [];

        if (records.length > 0) {
          upsertRecordsInStore({ partialRecords: records });
        }

        setRecordIdsForColumn(recordGroupDefinition.id, records);
        // Group-by pageInfo.hasNextPage is always false for record pages.
        store.set(
          recordBoardShouldFetchMoreInColumnFamilyCallbackState(
            recordGroupDefinition.id,
          ),
          records.length <
            (totalCountByGroupId.get(recordGroupDefinition.id) ?? 0),
        );
      }

      cleanStateBeforeExit();
    },
    [
      recordIndexRecordGroupsAreInInitialLoading,
      recordBoardQueryGeneration,
      recordBoardGroupQueryGenerationFamilyCallbackState,
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
