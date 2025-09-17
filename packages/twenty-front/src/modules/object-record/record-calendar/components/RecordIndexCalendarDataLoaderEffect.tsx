import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { useRecordFieldGqlFields } from '@/object-record/record-field/hooks/useRecordTableRecordGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

export const RecordIndexCalendarDataLoaderEffect = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  const { upsertRecords: upsertRecordsInStore } = useUpsertRecordsInStore();

  const setRecordIndexAllRecordIdsSelector = useSetRecoilComponentState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const objectNameSingular = objectMetadataItem.nameSingular;

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const recordGqlFields = useRecordFieldGqlFields({ objectMetadataItem });

  const { records } = useFindManyRecords({
    ...params,
    limit: 100,
    recordGqlFields,
  });

  useEffect(() => {
    upsertRecordsInStore(records);
    setRecordIndexAllRecordIdsSelector(records.map((record) => record.id));
  }, [records, setRecordIndexAllRecordIdsSelector, upsertRecordsInStore]);

  return <></>;
};
