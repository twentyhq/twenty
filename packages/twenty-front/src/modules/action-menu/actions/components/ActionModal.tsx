import { ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ButtonAccent } from 'twenty-ui/input';

export type ActionModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  isLoading?: boolean;
};

export const ActionModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = 'Confirm',
  confirmButtonAccent = 'danger',
  isLoading = false,
}: ActionModalProps) => {
  const { openModal } = useModal();

  const { closeActionMenu } = useCloseActionMenu();

  const handleConfirmClick = () => {
    onConfirmClick();
    closeActionMenu();
  };

  const actionConfig = useContext(ActionConfigContext);
  const { actionMenuType } = useContext(ActionMenuContext);

  const isModalOpened = useRecoilComponentValueV2(
    isModalOpenedComponentState,
    `${actionConfig?.key}-action-modal-${actionMenuType}`,
  );

  if (!actionConfig) {
    return null;
  }

  const handleClick = () =>
    openModal(`${actionConfig.key}-action-modal-${actionMenuType}`);

  return (
    <>
      <ActionDisplay onClick={handleClick} />
      {isModalOpened &&
        createPortal(
          <ConfirmationModal
            modalId={`${actionConfig.key}-action-modal-${actionMenuType}`}
            title={title}
            subtitle={subtitle}
            onConfirmClick={handleConfirmClick}
            confirmButtonText={confirmButtonText}
            confirmButtonAccent={confirmButtonAccent}
            loading={isLoading}
          />,
          document.body,
        )}
    </>
  );
};
