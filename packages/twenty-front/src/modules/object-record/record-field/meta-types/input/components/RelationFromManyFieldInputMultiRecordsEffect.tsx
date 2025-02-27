import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState } from '@/object-record/multiple-objects/multiple-objects-picker/states/multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { useRecordPickerRecordsOptions } from '@/object-record/record-picker/hooks/useRecordPickerRecordsOptions';
import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/types/SingleRecordPickerRecord';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type RelationFromManyFieldInputMultiRecordsEffectProps = {
  recordPickerInstanceId: string;
};

export const RelationFromManyFieldInputMultiRecordsEffect = ({
  recordPickerInstanceId,
}: RelationFromManyFieldInputMultiRecordsEffectProps) => {
  const { fieldValue, fieldDefinition } =
    useRelationField<SingleRecordPickerRecord[]>();
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordPickerComponentInstanceContext,
  );

  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilComponentStateV2(
      multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState,
      recordPickerInstanceId,
    );

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
        ? fieldValue.map(
            (fieldValueItem: SingleRecordPickerRecord) => fieldValueItem.id,
          )
        : [],
    );
  }, [fieldValue, setObjectRecordMultiSelectCheckedRecordsIds]);

  useEffect(() => {
    setRecordMultiSelectIsLoading(records.loading);
  }, [records.loading, setRecordMultiSelectIsLoading]);

  return <></>;
};
