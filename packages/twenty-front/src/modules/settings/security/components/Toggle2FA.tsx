import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/icon';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const Toggle2FA = () => {
  const { addErrorToast } = useErrorToast();
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleChange = async () => {
    if (!currentWorkspace?.id) {
      throw new Error('User is not logged in');
    }

    const newEnforceValue = !currentWorkspace.isTwoFactorAuthenticationEnforced;

    try {
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
      setCurrentWorkspace({
        ...currentWorkspace,
        isTwoFactorAuthenticationEnforced: !newEnforceValue,
      });
      addErrorToast(CombinedGraphQLErrors.is(err) ? err : undefined, {
        children: err?.message,
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
