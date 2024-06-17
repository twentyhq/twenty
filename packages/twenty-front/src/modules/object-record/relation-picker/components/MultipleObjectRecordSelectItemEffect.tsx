import { useEffect } from 'react';
import isEqual from 'lodash.isequal';
import { SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';

import { objectRecordsMultiSelectState } from '@/activities/states/objectRecordsMultiSelectState';
import { selectedObjectRecordsIdsState } from '@/activities/states/selectedObjectRecordsIdsState';
import {
  ObjectRecordAndSelected,
  objectRecordMultiSelectFamilyState,
} from '@/object-record/record-field/states/objectRecordMultiSelectFamilyState';

export const MultipleObjectRecordSelectItemEffect = ({
  recordId,
}: {
  recordId: string;
}) => {
  const objectRecordsMultiSelect = useRecoilValue(
    objectRecordsMultiSelectState,
  );

  const selectedObjectRecordsIds = useRecoilValue(
    selectedObjectRecordsIdsState,
  );

  console.log('selectedObjectRecordsIds', selectedObjectRecordsIds);

  const [record, setRecord] = useRecoilState(
    objectRecordMultiSelectFamilyState(recordId),
  ) as [
    ObjectRecordAndSelected,
    SetterOrUpdater<ObjectRecordAndSelected | object>,
  ];

  useEffect(() => {
    const newRecordValue = {
      ...objectRecordsMultiSelect.find(
        (record) => record.record.id === recordId,
      ),
      selected: selectedObjectRecordsIds.includes(recordId),
    };
    if (!isEqual(record.selected, newRecordValue.selected)) {
      console.log('not equal', record, newRecordValue);
      setRecord({
        ...objectRecordsMultiSelect.find(
          (record) => record.record.id === recordId,
        ),
        selected: selectedObjectRecordsIds.includes(recordId),
      });
    }
  }, [
    objectRecordsMultiSelect,
    record,
    recordId,
    selectedObjectRecordsIds,
    setRecord,
  ]);

  return <></>;
};
