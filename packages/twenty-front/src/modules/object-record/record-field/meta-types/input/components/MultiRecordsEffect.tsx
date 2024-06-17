import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { objectRecordsIdsMultiSelectState } from '@/activities/states/objectRecordsIdsMultiSelectState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import {
  ObjectRecordAndSelected,
  objectRecordMultiSelectFamilyState,
} from '@/object-record/record-field/states/objectRecordMultiSelectFamilyState';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const MultiRecordsEffect = () => {
  const { fieldValue, fieldDefinition } = useRelationField<EntityForSelect[]>();
  console.log('MultiRecordsEffect rerender');
  // const relationPickerScopeId = getScopeIdFromComponentId(
  //   `relation-picker-${fieldDefinition.fieldMetadataId}`,
  // );
  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilState(objectRecordsIdsMultiSelectState);

  const { entities } = useRelationPickerEntitiesOptions({
    relationObjectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

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

  const selectedRecordsIds = useMemo(() => {
    console.log('selectedRecordsIds', fieldValue);
    return fieldValue.map((fieldValueItem: any) => fieldValueItem.id);
  }, [fieldValue]);

  const updateRecords = useRecoilCallback(
    ({ snapshot, set }) =>
      (newRecords: ObjectRecordForSelect[]) => {
        for (const newRecord of newRecords) {
          const currentRecord = snapshot
            .getLoadable(
              objectRecordMultiSelectFamilyState(newRecord.record.id),
            )
            .getValue() as ObjectRecordAndSelected;

          const newRecordWithSelected = {
            ...newRecord,
            selected: selectedRecordsIds.includes(newRecord.record.id),
          };

          if (
            !isDeeplyEqual(
              newRecordWithSelected.selected,
              currentRecord.selected,
            )
          ) {
            console.log(
              newRecord.record.id,
              'newrecordSelected',
              newRecordWithSelected.selected,
              'currentrecordselected',
              currentRecord.selected,
            );
            set(
              objectRecordMultiSelectFamilyState(
                newRecordWithSelected.record.id,
              ),
              newRecordWithSelected,
            );
          }
        }
      },
    [selectedRecordsIds],
  );

  // useEffect(() => {
  // }, [allRecords, updateRecords]);

  useEffect(() => {
    updateRecords(allRecords);
    const allRecordsIds = allRecords.map((record) => record.record.id);
    if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
      // checked with logs - is not re-updated
      setObjectRecordsIdsMultiSelect(allRecordsIds);
    }
  }, [
    allRecords,
    objectRecordsIdsMultiSelect,
    setObjectRecordsIdsMultiSelect,
    updateRecords,
  ]);

  return <></>;
};
