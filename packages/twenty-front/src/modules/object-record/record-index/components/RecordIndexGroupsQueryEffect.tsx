import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useSetRecordIdsForColumn } from '@/object-record/record-board/hooks/useSetRecordIdsForColumn';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordIndexGroupsRecordsGroupBy } from '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsGroupBy';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataItemComponentState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useEffect } from 'react';
import { findByProperty, isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupsQueryEffect = () => {
  const recordGroupDefinitions = useRecoilComponentValue(
    recordGroupDefinitionsComponentSelector,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const { data, error, loading } = useRecordIndexGroupsRecordsGroupBy({
    groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
    objectMetadataItem,
  });

  const { setRecordIdsForColumn } = useSetRecordIdsForColumn();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  console.log({
    data,
    error,
    loading,
  });

  useEffect(() => {
    if (!loading && isDefined(data) && !isDefined(error)) {
      const queryFieldName =
        getGroupByQueryResultGqlFieldName(objectMetadataItem);

      const groups = data?.[queryFieldName];

      console.log({ groups });

      for (const group of groups) {
        const recordGroupValue = group.groupByDimensionValues[0] as string;
        const records = getRecordsFromRecordConnection({
          recordConnection: group,
        });

        const recordGroup = recordGroupDefinitions.find(
          findByProperty('value', recordGroupValue),
        );

        upsertRecordsInStore(records);

        if (isDefined(recordGroup)) {
          setRecordIdsForColumn(recordGroup?.id, records);
        }
      }
    }
  }, [data, loading, error]);

  return <></>;
};
