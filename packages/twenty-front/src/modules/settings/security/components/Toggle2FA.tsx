import { useIsSsoEnabled } from '@/auth/hooks/useIsSsoEnabled';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { IconLifebuoy } from 'twenty-ui/display';
import { useMutation } from '@apollo/client/react';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

// Under SSO the IdP owns MFA — Twenty's local 2FA enforcement toggle is a
// dead control. Outer component bails out before any of the inner hooks
// (useSnackBar, useAtomState, useMutation) run, so neither the workspace
// state nor the GraphQL client need to be available when SSO is on.
export const Toggle2FA = () => {
  const isSsoEnabled = useIsSsoEnabled();

  if (isSsoEnabled) {
    return null;
  }

  return <Toggle2FAEnabled />;
};

const Toggle2FAEnabled = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
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
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
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
