import {
  StyledContainer,
  StyledDialog,
  StyledHeading,
} from './KeyboardShortcutMenuStyles';
import { t } from '@lingui/core/macro';
import { IconButton } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

type KeyboardMenuDialogProps = {
  onClose: () => void;
  children: React.ReactNode | React.ReactNode[];
};

export const KeyboardMenuDialog = ({
  onClose,
  children,
}: KeyboardMenuDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledDialog isMobile={isMobile}>
      <StyledHeading>
        {t`Keyboard shortcuts`}
        <IconButton
          aria-label={t`Close keyboard shortcuts`}
          variant="ghost"
          onClick={onClose}
        >
          <IconX />
        </IconButton>
      </StyledHeading>
      <StyledContainer>{children}</StyledContainer>
    </StyledDialog>
  );
};
