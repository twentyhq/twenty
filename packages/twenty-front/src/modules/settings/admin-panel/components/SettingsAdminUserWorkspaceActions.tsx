import { currentUserState } from '@/auth/states/currentUserState';
import { SettingsAdminTwoFactorAuthenticationRecoveryCode } from '@/settings/admin-panel/components/SettingsAdminTwoFactorAuthenticationRecoveryCode';
import { useHandleImpersonate } from '@/settings/admin-panel/hooks/useHandleImpersonate';
import { type WorkspaceInfo } from '@/settings/admin-panel/types/WorkspaceInfo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEyeShare } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledActionRow = styled.div`
  column-gap: ${themeCssVariables.spacing[2]};
  display: flex;
  flex-wrap: wrap;
  row-gap: ${themeCssVariables.spacing[3]};
`;

type SettingsAdminUserWorkspaceActionsProps = {
  userId: string;
  workspace: Pick<WorkspaceInfo, 'id' | 'allowImpersonation'>;
  memberName: string;
};

export const SettingsAdminUserWorkspaceActions = ({
  userId,
  workspace,
  memberName,
}: SettingsAdminUserWorkspaceActionsProps) => {
  const currentUser = useAtomStateValue(currentUserState);
  const { handleImpersonate, impersonatingUserId } = useHandleImpersonate();

  if (!isDefined(currentUser) || currentUser.id === userId) {
    return null;
  }

  return (
    <StyledActionRow>
      {currentUser.canImpersonate && (
        <Button
          startIcon={<IconEyeShare />}
          onClick={() => handleImpersonate(userId, workspace.id)}
          disabled={
            impersonatingUserId !== null ||
            workspace.allowImpersonation === false
          }
          variant="outline"
        >
          {workspace.allowImpersonation === false
            ? t`Impersonation is disabled for this workspace`
            : t`Impersonate`}
        </Button>
      )}
      {currentUser.canAccessFullAdminPanel && (
        <SettingsAdminTwoFactorAuthenticationRecoveryCode
          key={`${userId}-${workspace.id}`}
          userId={userId}
          workspaceId={workspace.id}
          memberName={memberName}
        />
      )}
    </StyledActionRow>
  );
};
