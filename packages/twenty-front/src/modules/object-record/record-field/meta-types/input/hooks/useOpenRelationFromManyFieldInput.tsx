export const useOpenRelationFromManyFieldInput = () => {
  // const { fieldValue, fieldDefinition } =
  //   useRelationField<SingleRecordPickerRecord[]>();

  // const { objectMetadataItem } = useObjectMetadataItem({
  //   objectNameSingular:
  //     fieldDefinition.metadata.relationObjectMetadataNameSingular,
  // });

  // const openRelationFromManyFieldInput = useRecoilCallback(
  //   ({ set, snapshot }) =>
  //     ({ fieldName, recordId }: { fieldName: string; recordId: string }) => {
  //       const recordPickerInstanceId = `relation-from-many-field-input-${recordId}`;

  // const newRecords = records.recordsToSelect.map((entity) => {
  //   const { record, ...recordIdentifier } = entity;
  //   return {
  //     objectMetadataItem: objectMetadataItem,
  //     record: record,
  //     recordIdentifier: recordIdentifier,
  //   };
  // });

  // for (const newRecord of newRecords) {
  //   const currentRecord = snapshot
  //     .getLoadable(
  //       multipleRecordPickerIsSelectedFamilyState(newRecord.record.id),
  //     )
  //     .getValue();

  //   const objectRecordMultiSelectCheckedRecordsIds = snapshot
  //     .getLoadable(multipleRecordPickerSelectedRecordsIdsFamilyState)
  //     .getValue();

  //   const newRecordWithSelected = {
  //     ...newRecord,
  //     selected: objectRecordMultiSelectCheckedRecordsIds.includes(
  //       newRecord.record.id,
  //     ),
  //   };

  //   if (
  //     !isDeeplyEqual(
  //       newRecordWithSelected.selected,
  //       currentRecord?.selected,
  //     )
  //   ) {
  //     set(
  //       multipleRecordPickerIsSelectedFamilyState(
  //         newRecordWithSelected.record.id,
  //       ),
  //       newRecordWithSelected,
  //     );
  //   }
  // }
  // const allRecordsIds = allRecords.map((record) => record.record.id);
  // if (!isDeeplyEqual(allRecordsIds, objectRecordsIdsMultiSelect)) {
  //   setObjectRecordsIdsMultiSelect(allRecordsIds);
  // }

  // setObjectRecordsIdsMultiSelect(
  //   fieldValue
  //     ? fieldValue.map(
  //         (fieldValueItem: SingleRecordPickerRecord) => fieldValueItem.id,
  //       )
  //     : [],
  // );

  // setRecordMultiSelectIsLoading(records.loading);
  //     },
  //   [],
  // );

  return { openRelationFromManyFieldInput: () => {} };
};
