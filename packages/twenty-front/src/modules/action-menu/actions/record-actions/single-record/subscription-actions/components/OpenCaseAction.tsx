import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { Suspense, lazy, useContext } from 'react';

const OpenCaseFormModal = lazy(() =>
  import(
    '@/action-menu/actions/record-actions/single-record/subscription-actions/components/OpenCaseFormModal'
  ).then((m) => ({ default: m.OpenCaseFormModal })),
);

export const OpenCaseAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const { objectMetadataItem } = useRecordIndexIdFromCurrentContextStore();

  const { openModal } = useModal();

  const actionConfig = useContext(ActionConfigContext);
  const { actionMenuType } = useContext(ActionMenuContext);
  const modalId = `${actionConfig?.key}-case-modal-${actionMenuType}`;

  const isModalOpened = useRecoilComponentValueV2(
    isModalOpenedComponentState,
    modalId,
  );

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
          <OpenCaseFormModal
            modalId={modalId}
            recordId={recordId}
            objectNameSingular={objectMetadataItem.nameSingular}
          />
        </Suspense>
      )}
    </>
  );
};
