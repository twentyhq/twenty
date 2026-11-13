import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { getRecordGqlRelationAliasVariables } from '@/object-record/graphql/utils/getRecordGqlRelationAliasVariables';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useScopedRelationAliases } from '@/object-record/record-column-scope/hooks/useScopedRelationAliases';
import { getScopedRelationAffectedParentRecordIds } from '@/object-record/record-column-scope/utils/getScopedRelationAffectedParentRecordIds';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { type RecordGqlFields } from 'twenty-shared/types';
import { useCallback } from 'react';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

const SCOPED_RELATIONS_REFRESH_GQL_FIELDS: RecordGqlFields = { id: true };

// Scoped values come from the table query, so a related record changed elsewhere only shows after its parent rows are refetched
export const RecordTableScopedRelationsRefreshEffect = () => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { objectMetadataItem, recordTableId } = useRecordTableContextOrThrow();
  const relationAliases = useScopedRelationAliases();

  const parentRecordIdsCallbackState = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields: SCOPED_RELATIONS_REFRESH_GQL_FIELDS,
    relationAliases,
  });

  const handleRecordOperation = useCallback(
    async ({
      objectMetadataItem: changedObjectMetadataItem,
      operation,
    }: ObjectRecordOperationBrowserEventDetail) => {
      const changedRelationAliases = relationAliases.filter(
        ({ relationObjectMetadataItem }) =>
          relationObjectMetadataItem.id === changedObjectMetadataItem.id,
      );

      if (!isNonEmptyArray(changedRelationAliases)) {
        return;
      }

      const parentRecordIds = getScopedRelationAffectedParentRecordIds({
        operation,
        parentRecordIds: store.get(parentRecordIdsCallbackState),
        getParentRecord: (parentRecordId) =>
          store.get(recordStoreFamilyState.atomFamily(parentRecordId)),
        aliases: changedRelationAliases.map(({ alias }) => alias),
        joinColumnNames: changedRelationAliases
          .map(
            ({ fieldName }) =>
              objectMetadataItem.fields.find(({ name }) => name === fieldName)
                ?.relation?.targetFieldMetadata.name,
          )
          .filter(isDefined)
          .map((name) => computeRelationGqlFieldJoinColumnName({ name })),
      });

      if (!isNonEmptyArray(parentRecordIds)) {
        return;
      }

      const { data } =
        await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
          query: findManyRecordsQuery,
          fetchPolicy: 'network-only',
          variables: {
            filter: { id: { in: parentRecordIds } },
            limit: parentRecordIds.length,
            ...getRecordGqlRelationAliasVariables(relationAliases),
          },
        });

      const recordConnection = data?.[objectMetadataItem.namePlural];

      if (isDefined(recordConnection)) {
        upsertRecordsInStore({
          partialRecords: getRecordsFromRecordConnection({ recordConnection }),
        });
      }
    },
    [
      relationAliases,
      store,
      parentRecordIdsCallbackState,
      objectMetadataItem,
      apolloCoreClient,
      findManyRecordsQuery,
      upsertRecordsInStore,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    enabled: isNonEmptyArray(relationAliases),
  });

  return null;
};
