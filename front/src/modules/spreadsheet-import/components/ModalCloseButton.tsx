import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ButtonVariant } from '@/ui/button/components/Button';
import { IconButton } from '@/ui/button/components/IconButton';
import { useDialog } from '@/ui/dialog/hooks/useDialog';
import { IconX } from '@/ui/icon/index';

const CloseButtonContainer = styled.div`
  align-items: center;
  aspect-ratio: 1;
  display: flex;
  height: 60px;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
`;

type ModalCloseButtonProps = {
  onClose: () => void;
};

export const ModalCloseButton = ({ onClose }: ModalCloseButtonProps) => {
  const theme = useTheme();

  const { enqueueDialog } = useDialog();

  function handleClose() {
    enqueueDialog({
      title: 'Exit import flow',
      message: 'Are you sure? Your current information will not be saved.',
      buttons: [
        { title: 'Cancel' },
        { title: 'Exit', onClick: onClose, variant: ButtonVariant.Danger },
      ],
    });
  }

  return (
    <>
      <CloseButtonContainer>
        <IconButton
          icon={<IconX size={16} color={theme.font.color.tertiary} />}
          onClick={handleClose}
        />
      </CloseButtonContainer>
    </>
  );
};
