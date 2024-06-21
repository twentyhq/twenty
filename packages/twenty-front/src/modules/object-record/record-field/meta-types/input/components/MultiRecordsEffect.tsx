import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { objectRecordsIdsMultiSelectState } from '@/activities/states/objectRecordsIdsMultiSelectState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { objectRecordMultiSelectCheckedRecordsIdsState } from '@/object-record/record-field/states/objectRecordMultiSelectCheckedRecordsIdsState';
import { objectRecordMultiSelectFamilyState } from '@/object-record/record-field/states/objectRecordMultiSelectFamilyState';
import { recordMultiSelectIsLoadingState } from '@/object-record/record-field/states/recordMultiSelectIsLoadingState';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const MultiRecordsEffect = () => {
  const { fieldValue, fieldDefinition } = useRelationField<EntityForSelect[]>();
  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilState(objectRecordsIdsMultiSelectState);

  const { entities } = useRelationPickerEntitiesOptions({
    relationObjectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const setRecordMultiSelectIsLoading = useSetRecoilState(
    recordMultiSelectIsLoadingState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const allRecords = useMemo(
    () => [
      ...entities.entitiesToSelect.map((entity) => {
        const { record, ...recordIdentifier } = entity;
        return {
          objectMetadataItem: objectMetadataItem,
          record: record,
          recordIdentifier: recordIdentifier,
        };
      }),
    ],
    [entities.entitiesToSelect, objectMetadataItem],
  );

  const [
    objectRecordMultiSelectCheckedRecordsIds,
    setObjectRecordMultiSelectCheckedRecordsIds,
  ] = useRecoilState(objectRecordMultiSelectCheckedRecordsIdsState);

  const updateRecords = useRecoilCallback(
    ({ snapshot, set }) =>
      (newRecords: ObjectRecordForSelect[]) => {
        for (const newRecord of newRecords) {
          const currentRecord = snapshot
            .getLoadable(
              objectRecordMultiSelectFamilyState(newRecord.record.id),
            )
            .getValue();

          const newRecordWithSelected = {
            ...newRecord,
            selected: objectRecordMultiSelectCheckedRecordsIds.includes(
              newRecord.record.id,
            ),
          };

          if (
            !isDeeplyEqual(
              newRecordWithSelected.selected,
              currentRecord?.selected,
            )
          ) {
            set(
              objectRecordMultiSelectFamilyState(
                newRecordWithSelected.record.id,
              ),
              newRecordWithSelected,
            );
          }
        }
      },
    [objectRecordMultiSelectCheckedRecordsIds],
  );

  useEffect(() => {
    updateRecords(allRecords);
    const allRecordsIds = allRecords.map((record) => record.record.id);
    if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
      setObjectRecordsIdsMultiSelect(allRecordsIds);
    }
  }, [
    allRecords,
    objectRecordsIdsMultiSelect,
    setObjectRecordsIdsMultiSelect,
    updateRecords,
  ]);

  useEffect(() => {
    setObjectRecordMultiSelectCheckedRecordsIds(
      fieldValue.map((fieldValueItem: any) => fieldValueItem.id),
    );
  }, [fieldValue, setObjectRecordMultiSelectCheckedRecordsIds]);

  useEffect(() => {
    setRecordMultiSelectIsLoading(entities.loading);
  }, [entities.loading, setRecordMultiSelectIsLoading]);

  return <></>;
};
