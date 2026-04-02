import { commandMenuEditAutoSelectedRecordIdState } from '@/command-menu-item/server-items/edit/states/commandMenuEditAutoSelectedRecordIdState';
import { getRecordIndexId } from '@/command-menu-item/server-items/edit/utils/getRecordIndexId';
import { unselectRecord } from '@/command-menu-item/server-items/edit/utils/unselectRecord';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUnselectEditModeRecord = () => {
  const store = useStore();

  const unselectEditModeRecord = useCallback(() => {
    const previousRecordId = store.get(
      commandMenuEditAutoSelectedRecordIdState.atom,
    );

    if (!isDefined(previousRecordId)) {
      return;
    }

    const recordIndexId = getRecordIndexId(store);

    if (isDefined(recordIndexId)) {
      unselectRecord(store, previousRecordId, recordIndexId);
    }

    store.set(commandMenuEditAutoSelectedRecordIdState.atom, null);
  }, [store]);

  return { unselectEditModeRecord };
};
