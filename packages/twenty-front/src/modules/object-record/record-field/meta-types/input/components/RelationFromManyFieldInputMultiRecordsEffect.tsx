import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useObjectRecordMultiSelectScopedStates } from '@/activities/hooks/useObjectRecordMultiSelectScopedStates';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { objectRecordMultiSelectComponentFamilyState } from '@/object-record/record-field/states/objectRecordMultiSelectComponentFamilyState';
import { useRecordPickerRecordsOptions } from '@/object-record/relation-picker/hooks/useRecordPickerRecordsOptions';
import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RelationFromManyFieldInputMultiRecordsEffect = () => {
  const { fieldValue, fieldDefinition } = useRelationField<RecordForSelect[]>();
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );
  const {
    objectRecordsIdsMultiSelectState,
    objectRecordMultiSelectCheckedRecordsIdsState,
    recordMultiSelectIsLoadingState,
  } = useObjectRecordMultiSelectScopedStates(instanceId);
  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilState(objectRecordsIdsMultiSelectState);

  const { records } = useRecordPickerRecordsOptions({
    objectNameSingular:
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
      ...records.recordsToSelect.map((entity) => {
        const { record, ...recordIdentifier } = entity;
        return {
          objectMetadataItem: objectMetadataItem,
          record: record,
          recordIdentifier: recordIdentifier,
        };
      }),
    ],
    [records.recordsToSelect, objectMetadataItem],
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
              objectRecordMultiSelectComponentFamilyState({
                scopeId: instanceId,
                familyKey: newRecord.record.id,
              }),
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
              objectRecordMultiSelectComponentFamilyState({
                scopeId: instanceId,
                familyKey: newRecordWithSelected.record.id,
              }),
              newRecordWithSelected,
            );
          }
        }
      },
    [objectRecordMultiSelectCheckedRecordsIds, instanceId],
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
      fieldValue
        ? fieldValue.map((fieldValueItem: RecordForSelect) => fieldValueItem.id)
        : [],
    );
  }, [fieldValue, setObjectRecordMultiSelectCheckedRecordsIds]);

  useEffect(() => {
    setRecordMultiSelectIsLoading(records.loading);
  }, [records.loading, setRecordMultiSelectIsLoading]);

  return <></>;
};
