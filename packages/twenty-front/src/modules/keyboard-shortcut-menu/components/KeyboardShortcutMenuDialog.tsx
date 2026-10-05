import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { t } from '@lingui/core/macro';
import { IconButton } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledDialog = styled.div<{ isMobile: boolean }>`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  font-family: ${themeCssVariables.font.family};
  left: 50%;
  max-width: 400px;
  overflow: hidden;
  padding: 0;
  padding: ${themeCssVariables.spacing[1]};
  position: fixed;
  top: 30%;
  transform: ${({ isMobile }) =>
    isMobile ? 'translateX(-49.5%)' : 'translateX(-50%)'};
  width: ${({ isMobile }) => (isMobile ? 'calc(100% - 40px)' : '100%')};
  z-index: 1000;
`;

const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledContainer = styled.div`
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[4]};
  padding-left: ${themeCssVariables.spacing[4]};
  padding-right: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

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
