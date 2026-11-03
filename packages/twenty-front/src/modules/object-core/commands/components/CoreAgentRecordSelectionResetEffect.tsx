import { useContextStoreInstanceId } from '@/context-store/hooks/useContextStoreInstanceId';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useStore } from 'jotai';
import { useEffect } from 'react';

export const CoreAgentRecordSelectionResetEffect = () => {
  const store = useStore();
  const instanceId = useContextStoreInstanceId();
  useEffect(() => {
    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({ instanceId }),
      { mode: 'selection', selectedRecordIds: [] },
    );
    store.set(
      contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
        instanceId,
      }),
      0,
    );
  }, [instanceId, store]);
  return null;
};
