import styled from '@emotion/styled';

import { useSpreadsheetImportInitialStep } from '@/spreadsheet-import/hooks/useSpreadsheetImportInitialStep';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { useDialogManager } from '@/ui/feedback/dialog-manager/hooks/useDialogManager';
import { useStepBar } from '@/ui/navigation/step-bar/hooks/useStepBar';
import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledCloseButtonContainer = styled.div`
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
  const { initialStepState } = useSpreadsheetImportInternal();

  const { initialStep } = useSpreadsheetImportInitialStep(
    initialStepState?.type,
  );

  const { activeStep } = useStepBar({
    initialStep,
  });

  const { enqueueDialog } = useDialogManager();

  const { t } = useLingui();

  const handleClose = () => {
    if (activeStep === -1) {
      onClose();
      return;
    }
    enqueueDialog({
      title: t`Exit import flow`,
      message: t`Are you sure? Your current information will not be saved.`,
      buttons: [
        { title: t`Cancel` },
        {
          title: t`Exit`,
          onClick: onClose,
          accent: 'danger',
          role: 'confirm',
        },
      ],
    });
  };

  return (
    <StyledCloseButtonContainer>
      <IconButton Icon={IconX} onClick={handleClose} />
    </StyledCloseButtonContainer>
  );
};
