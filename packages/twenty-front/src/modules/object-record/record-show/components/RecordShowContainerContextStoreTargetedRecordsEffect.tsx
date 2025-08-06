import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

export const RecordShowContainerContextStoreTargetedRecordsEffect = ({
  recordId,
}: {
  recordId: string;
}) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentState(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  useEffect(() => {
    setContextStoreTargetedRecordsRule({
      mode: 'selection',
      selectedRecordIds: [recordId],
    });
    setContextStoreNumberOfSelectedRecords(1);

    return () => {
      setContextStoreTargetedRecordsRule({
        mode: 'selection',
        selectedRecordIds: [],
      });
      setContextStoreNumberOfSelectedRecords(0);
    };
  }, [
    recordId,
    setContextStoreTargetedRecordsRule,
    setContextStoreNumberOfSelectedRecords,
  ]);

  return null;
};
