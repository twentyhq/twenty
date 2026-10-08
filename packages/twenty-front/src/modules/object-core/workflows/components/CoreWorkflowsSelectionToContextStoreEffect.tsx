import { useStore } from 'jotai';
import { useEffect } from 'react';

import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreRecordIdsInSelectionOrderComponentState } from '@/context-store/states/contextStoreRecordIdsInSelectionOrderComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { orderRecordIdsBySelection } from '@/context-store/utils/orderRecordIdsBySelection';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { buildWorkflowRecordFromCoreWorkflow } from '@/object-core/workflows/utils/buildWorkflowRecordFromCoreWorkflow';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

type CoreWorkflowsSelectionToContextStoreEffectProps = {
  selectedCoreWorkflows: CoreWorkflow[];
};

export const CoreWorkflowsSelectionToContextStoreEffect = ({
  selectedCoreWorkflows,
}: CoreWorkflowsSelectionToContextStoreEffectProps) => {
  const store = useStore();

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const contextStoreTargetedRecordsRuleAtom =
    useAtomComponentStateCallbackState(
      contextStoreTargetedRecordsRuleComponentState,
    );

  const contextStoreRecordIdsInSelectionOrderAtom =
    useAtomComponentStateCallbackState(
      contextStoreRecordIdsInSelectionOrderComponentState,
    );

  const contextStoreNumberOfSelectedRecordsAtom =
    useAtomComponentStateCallbackState(
      contextStoreNumberOfSelectedRecordsComponentState,
    );

  useEffect(() => {
    const selectedRecordIds = selectedCoreWorkflows.map(({ id }) => id);

    upsertRecordsInStore({
      partialRecords: selectedCoreWorkflows.map(
        buildWorkflowRecordFromCoreWorkflow,
      ),
    });

    store.set(contextStoreTargetedRecordsRuleAtom, {
      mode: 'selection',
      selectedRecordIds,
    });

    store.set(
      contextStoreRecordIdsInSelectionOrderAtom,
      orderRecordIdsBySelection({
        previousRecordIdsInSelectionOrder: store.get(
          contextStoreRecordIdsInSelectionOrderAtom,
        ),
        selectedRecordIds,
      }),
    );

    store.set(
      contextStoreNumberOfSelectedRecordsAtom,
      selectedRecordIds.length,
    );
  }, [
    contextStoreNumberOfSelectedRecordsAtom,
    contextStoreRecordIdsInSelectionOrderAtom,
    contextStoreTargetedRecordsRuleAtom,
    selectedCoreWorkflows,
    store,
    upsertRecordsInStore,
  ]);

  useEffect(
    () => () => {
      store.set(contextStoreTargetedRecordsRuleAtom, {
        mode: 'selection',
        selectedRecordIds: [],
      });
      store.set(contextStoreRecordIdsInSelectionOrderAtom, []);
      store.set(contextStoreNumberOfSelectedRecordsAtom, 0);
    },
    [
      contextStoreNumberOfSelectedRecordsAtom,
      contextStoreRecordIdsInSelectionOrderAtom,
      contextStoreTargetedRecordsRuleAtom,
      store,
    ],
  );

  return null;
};
