import { Dialog } from 'twenty-ui/primitives/surfaces';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import { buildApplicationCapabilitySummary } from '@/marketplace/utils/buildApplicationCapabilitySummary';
import {
  buildPermissionSummaryFromRoleManifest,
  type PermissionSummaryItem,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';
import { LightButton } from 'twenty-ui/components';
import { IconChevronLeft } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: RoleManifest;
  requestedCapabilities?: string[];
  onAuthorize: () => void;
  isInstalling?: boolean;
};

const StyledFullscreenContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: relative;
  width: 100%;
`;

const StyledLightButton = styled(LightButton)`
  left: ${themeCssVariables.spacing[4]};
  position: absolute;
  top: ${themeCssVariables.spacing[4]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 400px;
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

const StyledPermissionsCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-bottom: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPermissionsTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

const StyledPermissionRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledPermissionIcon = styled.div`
  color: ${themeCssVariables.color.blue9};
  display: flex;
`;

export const SettingsApplicationInstallPermissionValidationModal = ({
  modalInstanceId,
  appDisplayName,
  appLogoUrl,
  defaultRole,
  requestedCapabilities = [],
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { closeDialog } = useDialog();

  const permissionItems: PermissionSummaryItem[] = useMemo(() => {
    const rolePermissionItems = defaultRole
      ? buildPermissionSummaryFromRoleManifest(defaultRole)
      : [];

    return [
      ...rolePermissionItems,
      ...buildApplicationCapabilitySummary(requestedCapabilities),
    ];
  }, [requestedCapabilities, defaultRole]);

  const handleAuthorize = () => {
    closeDialog(modalInstanceId);
    onAuthorize();
  };

  const handleClose = () => {
    closeDialog(modalInstanceId);
  };

  return (
    <DialogInstance
      dialogId={modalInstanceId}
      dismissible
      onClose={handleClose}
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={t`Install ${appDisplayName} on your workspace`}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="fullscreen"
          style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
        >
          <StyledFullscreenContainer>
            <StyledLightButton
              startIcon={<IconChevronLeft />}
              onClick={handleClose}
            >{t`Back to settings`}</StyledLightButton>

            <StyledContent>
              <StyledAppConnectionHeaderContainer>
                <AppConnectionHeader
                  appLogoUrl={appLogoUrl}
                  appName={appDisplayName}
                />
              </StyledAppConnectionHeaderContainer>

              <StyledTitle>
                {t`Install ${appDisplayName} on your workspace`}
              </StyledTitle>

              {permissionItems.length > 0 && (
                <StyledPermissionsCard>
                  <StyledPermissionsTitle>
                    {t`${appDisplayName} would like to:`}
                  </StyledPermissionsTitle>
                  {permissionItems.map((item) => (
                    <StyledPermissionRow key={item.label}>
                      <StyledPermissionIcon>
                        <item.Icon size={16} />
                      </StyledPermissionIcon>
                      {item.label}
                    </StyledPermissionRow>
                  ))}
                </StyledPermissionsCard>
              )}

              <AuthorizeActionButtons
                onCancel={handleClose}
                onAuthorize={handleAuthorize}
                isLoading={isInstalling}
              />
            </StyledContent>
          </StyledFullscreenContainer>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};
