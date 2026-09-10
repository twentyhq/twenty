import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { isNonEmptyString } from '@sniptt/guards';

import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

type CoreWorkflowsSelectionToContextStoreEffectProps = {
  selectedWorkspaceWorkflowIds: string[];
};

export const CoreWorkflowsSelectionToContextStoreEffect = ({
  selectedWorkspaceWorkflowIds,
}: CoreWorkflowsSelectionToContextStoreEffectProps) => {
  const targetedRecordsRuleAtom = useAtomComponentStateCallbackState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const numberOfSelectedRecordsAtom = useAtomComponentStateCallbackState(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const setTargetedRecordsRule = useSetAtom(targetedRecordsRuleAtom);
  const setNumberOfSelectedRecords = useSetAtom(numberOfSelectedRecordsAtom);

  const selectedWorkspaceWorkflowIdsKey =
    selectedWorkspaceWorkflowIds.join(',');

  useEffect(() => {
    const selectedRecordIds = selectedWorkspaceWorkflowIdsKey
      .split(',')
      .filter(isNonEmptyString);

    setTargetedRecordsRule({ mode: 'selection', selectedRecordIds });
    setNumberOfSelectedRecords(selectedRecordIds.length);
  }, [
    selectedWorkspaceWorkflowIdsKey,
    setTargetedRecordsRule,
    setNumberOfSelectedRecords,
  ]);

  useEffect(
    () => () => {
      setTargetedRecordsRule({ mode: 'selection', selectedRecordIds: [] });
      setNumberOfSelectedRecords(0);
    },
    [setTargetedRecordsRule, setNumberOfSelectedRecords],
  );

  return null;
};
