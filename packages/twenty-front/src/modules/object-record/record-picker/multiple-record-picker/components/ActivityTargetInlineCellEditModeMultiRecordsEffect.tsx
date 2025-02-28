import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';

import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { multipleRecordPickerIsSelectedComponentFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsSelectedComponentFamilyState';
import { multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState';
import { multipleRecordPickerSelectedRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSelectedRecordsIdsComponentState';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { SelectedObjectRecordId } from '@/object-record/types/SelectedObjectRecordId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// Todo: this effect should be deprecated to use sync hooks
export const ActivityTargetInlineCellEditModeMultiRecordsEffect = ({
  recordPickerInstanceId,
  selectedObjectRecordIds,
}: {
  recordPickerInstanceId: string;
  selectedObjectRecordIds: SelectedObjectRecordId[];
}) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    MultipleRecordPickerComponentInstanceContext,
    recordPickerInstanceId,
  );

  const multipleRecordPickerSelectedRecordsIdsFamilyState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerSelectedRecordsIdsComponentState,
      instanceId,
    );

  const multipleRecordPickerIsSelectedFamilyState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerIsSelectedComponentFamilyState,
      instanceId,
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
            selected: objectRecordMultiSelectCheckedRecordsIds.some(
              (checkedRecordId) => checkedRecordId === newRecord.record.id,
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

  const matchesSearchFilterObjectRecords = useRecoilComponentValueV2(
    multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState,
    instanceId,
  );

  const [selectedRecordsIds, setSelectedRecordsIds] = useRecoilComponentStateV2(
    multipleRecordPickerSelectedRecordsIdsComponentState,
    instanceId,
  );

  useEffect(() => {
    const allRecords = matchesSearchFilterObjectRecords ?? [];
    updateRecords(allRecords);
    const allRecordsIds = allRecords.map((record) => record.record.id);
    if (!isDeeplyEqual(allRecordsIds, selectedRecordsIds)) {
      setSelectedRecordsIds(allRecordsIds);
    }
  }, [
    matchesSearchFilterObjectRecords,
    selectedRecordsIds,
    setSelectedRecordsIds,
    updateRecords,
  ]);

  useEffect(() => {
    setSelectedRecordsIds(selectedObjectRecordIds.map((rec) => rec.id));
  }, [selectedObjectRecordIds, setSelectedRecordsIds]);

  return <></>;
};
