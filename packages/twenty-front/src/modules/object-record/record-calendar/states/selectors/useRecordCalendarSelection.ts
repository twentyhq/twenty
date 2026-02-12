import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedRecordIdsComponentSelector } from './recordCalendarSelectedRecordIdsComponentSelector';

export const useRecordCalendarSelection = (recordCalendarId?: string) => {
  const instanceIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
    recordCalendarId,
  );

  const isRecordCalendarCardSelectedFamilyState =
    useRecoilComponentCallbackState(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordCalendarId,
    );

  const recordCalendarSelectedRecordIdsSelector =
    useRecoilComponentCallbackState(
      recordCalendarSelectedRecordIdsComponentSelector,
      recordCalendarId,
    );

  const { closeDropdown } = useCloseDropdown();

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(
    getActionMenuIdFromRecordIndexId(instanceIdFromProps),
  );

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        closeDropdown(dropdownId);

        const recordIds = getSnapshotValue(
          snapshot,
          recordCalendarSelectedRecordIdsSelector,
        );

        for (const recordId of recordIds) {
          set(isRecordCalendarCardSelectedFamilyState(recordId), false);
        }
      },
    [
      closeDropdown,
      dropdownId,
      recordCalendarSelectedRecordIdsSelector,
      isRecordCalendarCardSelectedFamilyState,
    ],
  );

  return {
    resetRecordSelection,
  };
};
