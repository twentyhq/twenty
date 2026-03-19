import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { Suspense, lazy, useContext } from 'react';

const BulkCreateTasksFormModal = lazy(() =>
  import(
    '@/action-menu/actions/record-actions/single-record/subscription-actions/components/BulkCreateTasksFormModal'
  ).then((m) => ({ default: m.BulkCreateTasksFormModal })),
);

export const BulkCreateTasksAction = () => {
  const { openModal } = useModal();

  const actionConfig = useContext(ActionConfigContext);
  const { actionMenuType } = useContext(ActionMenuContext);
  const modalId = `${actionConfig?.key}-bulk-tasks-modal-${actionMenuType}`;

  const isModalOpened = useRecoilComponentValueV2(
    isModalOpenedComponentState,
    modalId,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const handleClick = () => {
    openModal(modalId);
  };

  if (!actionConfig) {
    return null;
  }

  return (
    <>
      <ActionDisplay onClick={handleClick} />
      {isModalOpened && (
        <Suspense fallback={null}>
          <BulkCreateTasksFormModal
            modalId={modalId}
            selectedRecordIds={selectedRecordIds}
            objectNameSingular="tobSubscription"
          />
        </Suspense>
      )}
    </>
  );
};
