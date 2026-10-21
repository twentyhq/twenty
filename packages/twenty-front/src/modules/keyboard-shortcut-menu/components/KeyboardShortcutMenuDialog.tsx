import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';

const StyledOverlay = styled.div`
  inset: 0;
  position: fixed;
  z-index: ${RootStackingContextZIndices.RootModal};
`;

const StyledTitle = styled.h2`
  text-align: start;
`;

const StyledHeading = styled.div`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledGroups = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-4);
`;

type KeyboardMenuDialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const KeyboardMenuDialog = ({
  open,
  onClose,
  children,
}: KeyboardMenuDialogProps) => (
  <Dialog.Root
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
      }
    }}
  >
    <Dialog.Portal>
      <StyledOverlay>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup size="md">
            <Dialog.Header render={<StyledHeading />}>
              <Dialog.Title render={<StyledTitle />}>
                {t`Keyboard shortcuts`}
              </Dialog.Title>
              <Dialog.Close
                render={
                  <IconButton
                    aria-label={t`Close keyboard shortcuts`}
                    variant="ghost"
                  >
                    <IconX />
                  </IconButton>
                }
              />
            </Dialog.Header>
            <Dialog.Body>
              <StyledGroups>{children}</StyledGroups>
            </Dialog.Body>
          </Dialog.Popup>
        </Dialog.Viewport>
      </StyledOverlay>
    </Dialog.Portal>
  </Dialog.Root>
);
