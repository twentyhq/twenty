import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useListenToObjectRecordEventsForQuery } from '@/sse-db-event/hooks/useListenToObjectRecordEventsForQuery';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import {
  computeRecordGqlOperationFilter,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { DatabaseEventAction } from '~/generated/graphql';

export const RecordTableVirtualizedOnObjectRecordEventsEffect = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const { registerObjectOperation } = useRegisterObjectOperation();
  const { refetchAggregateQueries } = useRefetchAggregateQueries({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });
  const apolloCoreClient = useApolloCoreClient();
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular,
  });
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { objectMetadataItems } = useObjectMetadataItems();

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
  });
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const debouncedRefetchAggregateQueries = useDebouncedCallback(
    refetchAggregateQueries,
    200,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const currentRecordSorts = useRecoilComponentValue(
    currentRecordSortsComponentState,
  );

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const queryId = `record-table-virtualized-${objectMetadataItem.nameSingular}`;

  useListenToObjectRecordEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: computeRecordGqlOperationFilter({
          fields: objectMetadataItem.fields,
          recordFilters: currentRecordFilters,
          recordFilterGroups: currentRecordFilterGroups,
          filterValueDependencies,
        }),
        orderBy: turnSortsIntoOrderBy(objectMetadataItem, currentRecordSorts),
      },
    },
    onObjectRecordEvents: (objectRecordEvents) => {
      const cache = apolloCoreClient.cache;

      const updateEvents = objectRecordEvents.filter(
        (objectRecordEvent) =>
          objectRecordEvent.action === DatabaseEventAction.UPDATED,
      );

      const updatedRecordsWithUpdatedFieldsOnly: ObjectRecord[] = [];
      for (const updateEvent of updateEvents) {
        const updatedRecord = updateEvent.properties.after;

        upsertRecordsInStore({ partialRecords: [updatedRecord] });

        const cachedRecord = getRecordFromCache<ObjectRecord>(updatedRecord.id);
        const cachedRecordWithConnection =
          getRecordNodeFromRecord<ObjectRecord>({
            record: cachedRecord,
            objectMetadataItem,
            objectMetadataItems,
            recordGqlFields: recordGqlFields,
            computeReferences: false,
          });

        const computedOptimisticRecord = {
          ...updatedRecord,
          id: updatedRecord.id,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        };

        const computedOptimisticRecordWithConnection =
          getRecordNodeFromRecord<ObjectRecord>({
            record: computedOptimisticRecord,
            objectMetadataItem,
            objectMetadataItems,
            recordGqlFields: recordGqlFields,
          });

        if (
          !isDefined(cachedRecordWithConnection) ||
          !isDefined(computedOptimisticRecordWithConnection)
        ) {
          continue;
        }

        triggerUpdateRecordOptimisticEffect({
          cache,
          objectMetadataItem,
          currentRecord: cachedRecordWithConnection,
          updatedRecord: computedOptimisticRecordWithConnection,
          objectMetadataItems,
          objectPermissionsByObjectMetadataId,
          upsertRecordsInStore,
        });

        const updatedFields = updateEvent.properties?.updatedFields ?? [];

        updatedRecordsWithUpdatedFieldsOnly.push({
          ...Object.fromEntries(
            updatedFields.map((fieldName) => {
              return [fieldName, updatedRecord[fieldName]];
            }),
          ),
          id: updatedRecord.id,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        });
      }

      registerObjectOperation(objectMetadataItem, {
        type: 'update-many',
        result: { updateInputs: updatedRecordsWithUpdatedFieldsOnly },
      });

      if (isNonEmptyArray(updateEvents)) {
        debouncedRefetchAggregateQueries();
      }
    },
  });

  return null;
};
