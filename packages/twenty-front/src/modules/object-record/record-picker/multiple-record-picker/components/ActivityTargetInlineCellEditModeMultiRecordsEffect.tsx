import { RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';

// Todo: this effect should be deprecated to use sync hooks
export const ActivityTargetInlineCellEditModeMultiRecordsEffect = ({
  _recordPickerInstanceId,
  _pickableRecordItems,
}: {
  _recordPickerInstanceId: string;
  _pickableRecordItems: RecordPickerPickableMorphItem[];
}) => {
  // const instanceId = useAvailableComponentInstanceIdOrThrow(
  //   MultipleRecordPickerComponentInstanceContext,
  //   recordPickerInstanceId,
  // );

  // const multipleRecordPickerSelectedRecordsIdsFamilyState =
  //   useRecoilComponentCallbackStateV2(
  //     multipleRecordPickerSelectedRecordsIdsComponentState,
  //     instanceId,
  //   );

  // const multipleRecordPickerIsSelectedFamilyState =
  //   useRecoilComponentCallbackStateV2(
  //     multipleRecordPickerIsSelectedComponentFamilyState,
  //     instanceId,
  //   );

  // const updateRecords = useRecoilCallback(
  //   ({ snapshot, set }) =>
  //     (newRecords: ObjectRecordForSelect[]) => {
  //       for (const newRecord of newRecords) {
  //         const currentRecord = snapshot
  //           .getLoadable(
  //             multipleRecordPickerIsSelectedFamilyState(newRecord.record.id),
  //           )
  //           .getValue();

  //         const objectRecordMultiSelectCheckedRecordsIds = snapshot
  //           .getLoadable(multipleRecordPickerSelectedRecordsIdsFamilyState)
  //           .getValue();

  //         const newRecordWithSelected = {
  //           ...newRecord,
  //           selected: objectRecordMultiSelectCheckedRecordsIds.some(
  //             (checkedRecordId) => checkedRecordId === newRecord.record.id,
  //           ),
  //         };

  //         if (
  //           !isDeeplyEqual(
  //             newRecordWithSelected.selected,
  //             currentRecord?.selected,
  //           )
  //         ) {
  //           set(
  //             multipleRecordPickerIsSelectedFamilyState(
  //               newRecordWithSelected.record.id,
  //             ),
  //             newRecordWithSelected,
  //           );
  //         }
  //       }
  //     },
  //   [
  //     multipleRecordPickerIsSelectedFamilyState,
  //     multipleRecordPickerSelectedRecordsIdsFamilyState,
  //   ],
  // );

  // const matchesSearchFilterObjectRecords = useRecoilComponentValueV2(
  //   multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState,
  //   instanceId,
  // );

  // const [selectedRecordsIds, setSelectedRecordsIds] = useRecoilComponentStateV2(
  //   multipleRecordPickerSelectedRecordsIdsComponentState,
  //   instanceId,
  // );

  // useEffect(() => {
  //   const allRecords = matchesSearchFilterObjectRecords ?? [];
  //   updateRecords(allRecords);
  //   const allRecordsIds = allRecords.map((record) => record.record.id);
  //   if (!isDeeplyEqual(allRecordsIds, selectedRecordsIds)) {
  //     setSelectedRecordsIds(allRecordsIds);
  //   }
  // }, [
  //   matchesSearchFilterObjectRecords,
  //   selectedRecordsIds,
  //   setSelectedRecordsIds,
  //   updateRecords,
  // ]);

  // useEffect(() => {
  //   setSelectedRecordsIds(selectedObjectRecordIds.map((rec) => rec.id));
  // }, [selectedObjectRecordIds, setSelectedRecordsIds]);

  return <></>;
};
