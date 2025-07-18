import { useRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/display';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';
import { TwoFactorAuthenticationStrategy } from '~/generated/graphql';

export const Toggle2FA = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async () => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }

      if (currentWorkspace.twoFactorAuthenticationPolicy.enforce) {
        setCurrentWorkspace({
          ...currentWorkspace,
          twoFactorAuthenticationPolicy: {
            strategy: TwoFactorAuthenticationStrategy.TOTP,
            enforce: true,
          },
        });

        await updateWorkspace({
          variables: {
            input: {
              twoFactorAuthenticationPolicy: {
                strategy: TwoFactorAuthenticationStrategy.TOTP,
                enforce: true,
              },
            },
          },
        });
      } else {
        setCurrentWorkspace({
          ...currentWorkspace,
          twoFactorAuthenticationPolicy: {
            strategy: TwoFactorAuthenticationStrategy.TOTP,
            enforce: false,
          },
        });

        await updateWorkspace({
          variables: {
            input: {
              twoFactorAuthenticationPolicy: null,
            },
          },
        });
      }
    } catch (err: any) {
      enqueueErrorSnackBar({
        message: err?.message,
      });
    }
  };

  return (
    <SettingsOptionCardContentToggle
      Icon={IconLifebuoy}
      title={t`Two Factor Authentication`}
      description={'Enforce two-step verification for every user login.'}
      checked={!!currentWorkspace?.twoFactorAuthenticationPolicy.enforce}
      onChange={handleChange}
      advancedMode
    />
  );
};
