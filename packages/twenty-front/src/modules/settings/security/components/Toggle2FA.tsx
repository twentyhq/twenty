import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';
import { IconLifebuoy } from 'twenty-ui/display';
import { TwoFactorAuthenticationPolicyEnforcement, TwoFactorAuthenticationProviders } from 'twenty-shared/workspace';
import { isTwoFactorAuthenticationGloballyEnforcedState } from '@/client-config/states/isTwoFactorAuthenticationGloballyEnforcedState copy';

export const Toggle2FA = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const isTwoFactorAuthenticationGloballyEnforced = useRecoilValue(isTwoFactorAuthenticationGloballyEnforcedState);
  

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async () => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }

      if (!currentWorkspace.twoFactorAuthenticationPolicy) {
        setCurrentWorkspace({
          ...currentWorkspace,
          twoFactorAuthenticationPolicy: {
            level: TwoFactorAuthenticationPolicyEnforcement.OPTIONAL,
            providers: TwoFactorAuthenticationProviders.HOTP
          }
        });

        await updateWorkspace({
          variables: {
            input: {
              twoFactorAuthenticationPolicy: {
                level: TwoFactorAuthenticationPolicyEnforcement.OPTIONAL,
                providers: TwoFactorAuthenticationProviders.HOTP
              }
            },
          },
        });
      } else {
        setCurrentWorkspace({
          ...currentWorkspace,
          twoFactorAuthenticationPolicy: null
        });

        await updateWorkspace({
          variables: {
            input: {
              twoFactorAuthenticationPolicy: null
            },
          },
        });
      }
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SettingsOptionCardContentToggle
      Icon={IconLifebuoy}
      title={t`Two Factor Authentication`}
      checked={!!currentWorkspace?.twoFactorAuthenticationPolicy || isTwoFactorAuthenticationGloballyEnforced}
      onChange={handleChange}
      advancedMode
    />
  );
};
