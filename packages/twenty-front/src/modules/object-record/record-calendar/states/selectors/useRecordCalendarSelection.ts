import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { RecordCalendarComponentInstanceContext } from '../contexts/RecordCalendarComponentInstanceContext';
import { isRecordCalendarCardSelectedComponentFamilyState } from '../../record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
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

  const setRecordAsSelected = useRecoilCallback(
    ({ snapshot, set }) =>
      (recordId: string, isSelected: boolean) => {
        const isRecordCurrentlySelected = snapshot
          .getLoadable(isRecordCalendarCardSelectedFamilyState(recordId))
          .getValue();

        if (isRecordCurrentlySelected === isSelected) {
          return;
        }

        set(isRecordCalendarCardSelectedFamilyState(recordId), isSelected);
      },
    [isRecordCalendarCardSelectedFamilyState],
  );

  const checkIfLastUnselectAndCloseDropdown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const recordIds = getSnapshotValue(
          snapshot,
          recordCalendarSelectedRecordIdsSelector,
        );
        if (recordIds.length === 0) {
          closeDropdown(dropdownId);
        }
      },
    [recordCalendarSelectedRecordIdsSelector, closeDropdown, dropdownId],
  );

  return {
    resetRecordSelection,
    setRecordAsSelected,
    checkIfLastUnselectAndCloseDropdown,
  };
};
