import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  type PermissionSummaryItem,
  buildPermissionSummaryFromRoleManifest,
} from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { type RoleManifest } from 'twenty-shared/application';
import {
  Avatar,
  IconEye,
  IconHierarchy,
  IconListDetails,
  IconRefresh,
  IconSettings,
  IconTool,
  IconTrash,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  StyledAppModal,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';

type SettingsApplicationInstallPermissionValidationModalProps = {
  modalInstanceId: string;
  appDisplayName: string;
  appLogoUrl?: string;
  defaultRole?: RoleManifest;
  onAuthorize: () => void;
  isInstalling?: boolean;
};

const StyledLogosContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledSyncIcon = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledPermissionsCard = styled.div`
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
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledButtonsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledButtonWrapper = styled.div`
  flex: 1;
`;

const StyledTitle = styled.div`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
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
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const permissionItems: PermissionSummaryItem[] = useMemo(() => {
    if (!defaultRole) {
      return [];
    }

    return buildPermissionSummaryFromRoleManifest(defaultRole, {
      IconListDetails,
      IconHierarchy,
      IconSettings,
      IconTool,
      IconEye,
      IconTrash,
    });
  }, [defaultRole]);

  const handleAuthorize = () => {
    closeModal(modalInstanceId);
    onAuthorize();
  };

  return (
    <StyledAppModal
      modalId={modalInstanceId}
      isClosable
      onClose={() => closeModal(modalInstanceId)}
      padding="large"
    >
      <StyledLogosContainer>
        <Avatar
          type="squared"
          size="xl"
          avatarUrl={currentWorkspace?.logo}
          placeholder={currentWorkspace?.displayName ?? ''}
          placeholderColorSeed={currentWorkspace?.displayName ?? ''}
        />
        <StyledSyncIcon>
          <IconRefresh size={16} />
        </StyledSyncIcon>
        <Avatar
          type="squared"
          size="xl"
          avatarUrl={appLogoUrl}
          placeholder={appDisplayName}
          placeholderColorSeed={appDisplayName}
        />
      </StyledLogosContainer>

      <StyledAppModalTitle>
        <StyledTitle>
          {t`Install ${appDisplayName} on your workspace`}
        </StyledTitle>
      </StyledAppModalTitle>

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

      <StyledButtonsContainer>
        <StyledButtonWrapper>
          <Button
            onClick={() => closeModal(modalInstanceId)}
            variant="secondary"
            title={t`Cancel`}
            fullWidth
            justify="center"
          />
        </StyledButtonWrapper>
        <StyledButtonWrapper>
          <Button
            onClick={handleAuthorize}
            variant="primary"
            accent="default"
            title={isInstalling ? t`Installing...` : t`Authorize`}
            disabled={isInstalling}
            fullWidth
            justify="center"
          />
        </StyledButtonWrapper>
      </StyledButtonsContainer>
    </StyledAppModal>
  );
};
