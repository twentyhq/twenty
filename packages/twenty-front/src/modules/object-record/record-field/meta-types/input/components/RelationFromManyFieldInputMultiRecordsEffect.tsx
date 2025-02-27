import { useEffect, useMemo } from 'react';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';
import { multipleRecordPickerIsSelectedComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsSelectedComponentFamilyState';
import { multipleRecordPickerSelectedRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSelectedRecordsIdsComponentState';
import { useSingleRecordPickerRecords } from '@/object-record/record-picker/single-record-picker/hooks/useSingleRecordPickerRecords';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type RelationFromManyFieldInputMultiRecordsEffectProps = {
  recordPickerInstanceId: string;
};

export const RelationFromManyFieldInputMultiRecordsEffect = ({
  recordPickerInstanceId,
}: RelationFromManyFieldInputMultiRecordsEffectProps) => {
  const { fieldValue, fieldDefinition } =
    useRelationField<SingleRecordPickerRecord[]>();

  const [objectRecordsIdsMultiSelect, setObjectRecordsIdsMultiSelect] =
    useRecoilComponentStateV2(
      multipleRecordPickerSelectedRecordsIdsComponentState,
      recordPickerInstanceId,
    );

  const { records } = useSingleRecordPickerRecords({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const setRecordMultiSelectIsLoading = useSetRecoilComponentStateV2(
    multipleRecordPickerIsLoadingComponentState,
    recordPickerInstanceId,
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

  const multipleRecordPickerIsSelectedFamilyState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerIsSelectedComponentFamilyState,
      recordPickerInstanceId,
    );

  const multipleRecordPickerSelectedRecordsIdsFamilyState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerSelectedRecordsIdsComponentState,
      recordPickerInstanceId,
    );

  const updateRecords = useRecoilCallback(
    ({ snapshot, set }) =>
      (newRecords: ObjectRecordForSelect[]) => {
        for (const newRecord of newRecords) {
          const currentRecord = snapshot
            .getLoadable(
              multipleRecordPickerIsSelectedFamilyState(newRecord.record.id),
            )
            .getValue();

          const objectRecordMultiSelectCheckedRecordsIds = snapshot
            .getLoadable(multipleRecordPickerSelectedRecordsIdsFamilyState)
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
              multipleRecordPickerIsSelectedFamilyState(
                newRecordWithSelected.record.id,
              ),
              newRecordWithSelected,
            );
          }
        }
      },
    [
      multipleRecordPickerIsSelectedFamilyState,
      multipleRecordPickerSelectedRecordsIdsFamilyState,
    ],
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
    setObjectRecordsIdsMultiSelect(
      fieldValue
        ? fieldValue.map(
            (fieldValueItem: SingleRecordPickerRecord) => fieldValueItem.id,
          )
        : [],
    );
  }, [fieldValue, setObjectRecordsIdsMultiSelect]);

  useEffect(() => {
    setRecordMultiSelectIsLoading(records.loading);
  }, [records.loading, setRecordMultiSelectIsLoading]);

  return <></>;
};
