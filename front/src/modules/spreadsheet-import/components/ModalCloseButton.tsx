import { useState } from 'react';
import { IconButton } from '@chakra-ui/react';

import { IconX } from '@/ui/icon/index';

import { ConfirmCloseAlert } from './Alerts/ConfirmCloseAlert';

type ModalCloseButtonProps = {
  onClose: () => void;
};

export const ModalCloseButton = ({ onClose }: ModalCloseButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <ConfirmCloseAlert
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false);
          onClose();
        }}
      />
      <IconButton
        variant="unstyled"
        aria-label="Close modal"
        icon={<IconX />}
        color="white"
        position="absolute"
        transform="translate(50%, -50%)"
        right="14px"
        top="20px"
        onClick={() => setShowModal(true)}
        zIndex="toast"
        dir="ltr"
      />
    </>
  );
};
