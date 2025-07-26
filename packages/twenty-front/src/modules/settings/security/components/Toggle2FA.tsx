import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/display';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';

export const Toggle2FA = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const newEnforceValue = !currentWorkspace.isTwoFactorAuthenticationEnforced;

    try {
      // Optimistic update
      setCurrentWorkspace({
        ...currentWorkspace,
        isTwoFactorAuthenticationEnforced: newEnforceValue,
      });

      await updateWorkspace({
        variables: {
          input: {
            isTwoFactorAuthenticationEnforced: newEnforceValue,
          },
        },
      });
    } catch (err: any) {
      // Rollback optimistic update if error
      setCurrentWorkspace({
        ...currentWorkspace,
        isTwoFactorAuthenticationEnforced: !newEnforceValue,
      });
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
        message: err?.message,
      });
    }
  };

  return (
    <>
      {currentWorkspace && (
        <SettingsOptionCardContentToggle
          Icon={IconLifebuoy}
          title={t`Two Factor Authentication`}
          description={t`Enforce two-step verification for every user login.`}
          checked={currentWorkspace.isTwoFactorAuthenticationEnforced}
          onChange={handleChange}
          advancedMode
        />
      )}
    </>
  );
};
