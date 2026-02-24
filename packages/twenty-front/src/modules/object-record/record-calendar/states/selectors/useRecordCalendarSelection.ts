import { useCallback } from 'react';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedRecordIdsComponentSelector } from './recordCalendarSelectedRecordIdsComponentSelector';

export const useRecordCalendarSelection = (recordCalendarId?: string) => {
  const instanceIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
    recordCalendarId,
  );

  const isRecordCalendarCardSelectedFamilyState =
    useRecoilComponentFamilyStateCallbackStateV2(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordCalendarId,
    );

  const recordCalendarSelectedRecordIdsAtom =
    useRecoilComponentSelectorCallbackStateV2(
      recordCalendarSelectedRecordIdsComponentSelector,
      recordCalendarId,
    );

  const { closeDropdown } = useCloseDropdown();
  const store = useStore();

  const dropdownId = getActionMenuDropdownIdFromActionMenuId(
    getActionMenuIdFromRecordIndexId(instanceIdFromProps),
  );

  const resetRecordSelection = useCallback(() => {
    closeDropdown(dropdownId);

    const recordIds = store.get(recordCalendarSelectedRecordIdsAtom);

    for (const recordId of recordIds) {
      store.set(isRecordCalendarCardSelectedFamilyState(recordId), false);
    }
  }, [
    closeDropdown,
    dropdownId,
    recordCalendarSelectedRecordIdsAtom,
    isRecordCalendarCardSelectedFamilyState,
    store,
  ]);

  return {
    resetRecordSelection,
  };
};
