import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { TwoFactorAuthenticationProviders } from '~/generated/graphql';
import { IconLifebuoy } from 'twenty-ui/display';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';

export const Toggle2FA = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [ updateWorkspace ] = useUpdateWorkspaceMutation();

  const handleChange = async () => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }

      if (!currentWorkspace.twoFactorAuthenticationPolicy) {
        setCurrentWorkspace({
          ...currentWorkspace,
          twoFactorAuthenticationPolicy: {
            strategy: TwoFactorAuthenticationProviders.HOTP,
          },
        });

        await updateWorkspace({
          variables: {
            input: {
              twoFactorAuthenticationPolicy: {
                strategy: TwoFactorAuthenticationProviders.HOTP,
              },
            },
          },
        });
      } else {
        setCurrentWorkspace({
          ...currentWorkspace,
          twoFactorAuthenticationPolicy: null,
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
      checked={!!currentWorkspace?.twoFactorAuthenticationPolicy}
      onChange={handleChange}
      advancedMode
    />
  );
};