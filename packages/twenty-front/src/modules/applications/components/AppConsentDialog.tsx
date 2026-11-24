import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { LightButton } from 'twenty-ui/components/input';
import { IconChevronLeft } from 'twenty-ui/icon';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

type AppConsentDialogProps = {
  dialogId: string;
  appName: string;
  appLogoUrl?: string | null;
  title: string;
  onAuthorize: () => void;
  isAuthorizing?: boolean;
  children: ReactNode;
};

const StyledFullscreenContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[16]} ${themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledBackButtonContainer = styled.div`
  left: ${themeCssVariables.spacing[4]};
  position: fixed;
  top: ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: auto 0;
  max-width: ${themeCssVariables.modal.size.md.width};
  width: 100%;
`;

const StyledAppConnectionHeaderContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

export const AppConsentDialog = ({
  dialogId,
  appName,
  appLogoUrl,
  title,
  onAuthorize,
  isAuthorizing,
  children,
}: AppConsentDialogProps) => {
  const { t } = useLingui();
  const { closeDialog } = useDialog();

  const handleClose = () => {
    closeDialog(dialogId);
  };

  const handleAuthorize = () => {
    closeDialog(dialogId);
    onAuthorize();
  };

  return (
    <DialogInstance
      dialogId={dialogId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ onKeyDown }) => (
        <Dialog.Popup
          aria-label={title}
          onKeyDown={onKeyDown}
          size="fullscreen"
        >
          <StyledFullscreenContainer>
            <StyledBackButtonContainer>
              <LightButton
                startIcon={<IconChevronLeft />}
                onClick={handleClose}
              >{t`Back to settings`}</LightButton>
            </StyledBackButtonContainer>

            <StyledContent>
              <StyledAppConnectionHeaderContainer>
                <AppConnectionHeader
                  appLogoUrl={appLogoUrl}
                  appName={appName}
                />
              </StyledAppConnectionHeaderContainer>

              <StyledTitle>{title}</StyledTitle>

              {children}

              <AuthorizeActionButtons
                onCancel={handleClose}
                onAuthorize={handleAuthorize}
                isLoading={isAuthorizing}
              />
            </StyledContent>
          </StyledFullscreenContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
