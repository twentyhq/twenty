import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { computeCursorArgFilter } from '@/object-record/graphql/utils/computeCursorArgFilter';
import { extractOrderByFieldNames } from '@/object-record/graphql/utils/extractOrderByFieldNames';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { computeRecordGroupOptionsFilter } from '@/object-record/record-group/utils/computeRecordGroupOptionsFilter';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { combineFilters, isDefined } from 'twenty-shared/utils';

export type RecordPositionInIndex = {
  position: number;
  recordGroupId?: string;
};

// The index paginates by offset, so the number of records the current filters
// and sorts place before a record is that record's row index, even when the
// view has not loaded it yet. With record groups the count runs inside the
// record's own group, which is how grouped tables and boards paginate.
export const useLazyFindRecordPositionInIndex = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { filter, orderBy } =
    useFindManyRecordIndexTableParams(objectNameSingular);

  const apolloCoreClient = useApolloCoreClient();

  const { canReadObjectRecords } = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGroupFieldMetadataItem =
    hasRecordGroups && isDefined(recordIndexGroupFieldMetadataItem)
      ? recordIndexGroupFieldMetadataItem
      : undefined;

  const recordGroupGqlFieldName = isDefined(recordGroupFieldMetadataItem)
    ? getFieldMetadataItemGqlFieldName(recordGroupFieldMetadataItem)
    : undefined;

  const { findManyRecordsQuery: findTargetRecordQuery } =
    useFindManyRecordsQuery({
      objectNameSingular,
      recordGqlFields: {
        ...extractOrderByFieldNames(orderBy),
        ...(isDefined(recordGroupGqlFieldName)
          ? { [recordGroupGqlFieldName]: true }
          : {}),
      },
    });

  const { findManyRecordsQuery: countRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields: { id: true },
  });

  const findRecordPositionInIndex = useCallback(
    async (recordId: string): Promise<RecordPositionInIndex | null> => {
      if (!canReadObjectRecords) {
        return null;
      }

      try {
        const targetRecordResult =
          await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
            query: findTargetRecordQuery,
            variables: {
              filter: combineFilters([filter, { id: { eq: recordId } }]),
              limit: 1,
            },
            fetchPolicy: 'no-cache',
          });

        const targetRecordConnection =
          targetRecordResult.data?.[objectMetadataItem.namePlural];

        if (!isDefined(targetRecordConnection)) {
          return null;
        }

        const [targetRecord] = getRecordsFromRecordConnection({
          recordConnection: targetRecordConnection,
        });

        if (!isDefined(targetRecord)) {
          return null;
        }

        let recordGroupId: string | undefined;
        let recordGroupFilter: RecordGqlOperationFilter = {};

        if (
          isDefined(recordGroupFieldMetadataItem) &&
          isDefined(recordGroupGqlFieldName)
        ) {
          const recordGroupValue =
            targetRecord[recordGroupGqlFieldName] ?? null;

          const recordGroupDefinition = recordGroupDefinitions.find(
            (definition) =>
              definition.isVisible && definition.value === recordGroupValue,
          );

          if (!isDefined(recordGroupDefinition)) {
            return null;
          }

          recordGroupId = recordGroupDefinition.id;
          recordGroupFilter = computeRecordGroupOptionsFilter({
            recordGroupFieldMetadata: recordGroupFieldMetadataItem,
            recordGroupValues: [recordGroupDefinition.value],
          });
        }

        const recordsBeforeTargetFilter = computeCursorArgFilter({
          orderBy,
          cursorRecordValues: targetRecord,
          isForwardPagination: false,
        });

        const countResult =
          await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
            query: countRecordsQuery,
            variables: {
              filter: combineFilters([
                filter,
                recordGroupFilter,
                recordsBeforeTargetFilter,
              ]),
              limit: 1,
            },
            fetchPolicy: 'no-cache',
          });

        const position =
          countResult.data?.[objectMetadataItem.namePlural]?.totalCount;

        return isDefined(position) ? { position, recordGroupId } : null;
      } catch {
        return null;
      }
    },
    [
      apolloCoreClient,
      canReadObjectRecords,
      countRecordsQuery,
      filter,
      findTargetRecordQuery,
      objectMetadataItem.namePlural,
      orderBy,
      recordGroupDefinitions,
      recordGroupFieldMetadataItem,
      recordGroupGqlFieldName,
    ],
  );

  return { findRecordPositionInIndex };
};
