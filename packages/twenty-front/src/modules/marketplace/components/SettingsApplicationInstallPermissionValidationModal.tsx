import { AppConnectionHeader } from '@/applications/components/AppConnectionHeader';
import { AuthorizeActionButtons } from '@/applications/components/AuthorizeActionButtons';
import {
  buildPermissionSummaryFromRoleManifest,
  type PermissionSummaryItem,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';
import { IconChevronLeft } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { StyledAppModal } from '~/pages/settings/applications/components/SettingsAppModalLayout';

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: RoleManifest;
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
  onAuthorize,
  isInstalling,
}: SettingsApplicationInstallPermissionValidationModalProps) => {
  const { closeModal } = useModal();

  const permissionItems: PermissionSummaryItem[] = useMemo(() => {
    if (!defaultRole) {
      return [];
    }

    return buildPermissionSummaryFromRoleManifest(defaultRole);
  }, [defaultRole]);

  const handleAuthorize = () => {
    closeModal(modalInstanceId);
    onAuthorize();
  };

  const handleClose = () => {
    closeModal(modalInstanceId);
  };

  return (
    <StyledAppModal
      modalId={modalInstanceId}
      isClosable
      onClose={handleClose}
      size="fullscreen"
      padding="none"
      overlay="transparent"
    >
      <StyledFullscreenContainer>
        <StyledLightButton
          Icon={IconChevronLeft}
          title={t`Back to settings`}
          onClick={handleClose}
        />

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
    </StyledAppModal>
  );
};
