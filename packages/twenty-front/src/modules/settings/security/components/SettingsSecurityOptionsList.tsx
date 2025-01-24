import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState, useRecoilValue } from 'recoil';
import { capitalize } from 'twenty-shared';
import {
  Card,
  IconGoogle,
  IconLink,
  IconMicrosoft,
  IconPassword,
} from 'twenty-ui';
import { AuthProviders } from '~/generated-metadata/graphql';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

const StyledSettingsSecurityOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsSecurityOptionsList = () => {
  const { t } = useLingui();

  const { enqueueSnackBar } = useSnackBar();
  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);
  const authProviders = useRecoilValue(authProvidersState);

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const isValidAuthProvider = (
    key: string,
  ): key is Exclude<keyof typeof currentWorkspace, '__typename'> => {
    if (!currentWorkspace) return false;
    return Reflect.has(currentWorkspace, key);
  };

  const toggleAuthMethod = async (
    authProvider: keyof Omit<AuthProviders, '__typename' | 'magicLink' | 'sso'>,
  ) => {
    if (!currentWorkspace?.id) {
      throw new Error(t`User is not logged in`);
    }

    const key = `is${capitalize(authProvider)}AuthEnabled`;

    if (!isValidAuthProvider(key)) {
      throw new Error(t`Invalid auth provider`);
    }

    const allAuthProvidersEnabled = [
      currentWorkspace.isGoogleAuthEnabled,
      currentWorkspace.isMicrosoftAuthEnabled,
      currentWorkspace.isPasswordAuthEnabled,
      (SSOIdentitiesProviders?.length ?? 0) > 0,
    ];

    if (
      currentWorkspace[key] === true &&
      allAuthProvidersEnabled.filter((isAuthEnabled) => isAuthEnabled).length <=
        1
    ) {
      return enqueueSnackBar(
        t`At least one authentication method must be enabled`,
        {
          variant: SnackBarVariant.Error,
        },
      );
    }

    setCurrentWorkspace({
      ...currentWorkspace,
      [key]: !currentWorkspace[key],
    });

    updateWorkspace({
      variables: {
        input: {
          [key]: !currentWorkspace[key],
        },
      },
    }).catch((err) => {
      // rollback optimistic update if err
      setCurrentWorkspace({
        ...currentWorkspace,
        [key]: !currentWorkspace[key],
      });
      enqueueSnackBar(err?.message, {
        variant: SnackBarVariant.Error,
      });
    });
  };

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error(t`User is not logged in`);
      }
      await updateWorkspace({
        variables: {
          input: {
            isPublicInviteLinkEnabled: value,
          },
        },
      });
      setCurrentWorkspace({
        ...currentWorkspace,
        isPublicInviteLinkEnabled: value,
      });
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <StyledSettingsSecurityOptionsList>
      {currentWorkspace && (
        <>
          <Card rounded>
            {authProviders.google === true && (
              <SettingsOptionCardContentToggle
                Icon={IconGoogle}
                title="Google"
                description={t`Allow logins through Google's single sign-on functionality.`}
                checked={currentWorkspace.isGoogleAuthEnabled}
                advancedMode
                divider
                onChange={() => toggleAuthMethod('google')}
              />
            )}
            {authProviders.microsoft === true && (
              <SettingsOptionCardContentToggle
                Icon={IconMicrosoft}
                title="Microsoft"
                description={t`Allow logins through Microsoft's single sign-on functionality.`}
                checked={currentWorkspace.isMicrosoftAuthEnabled}
                advancedMode
                divider
                onChange={() => toggleAuthMethod('microsoft')}
              />
            )}
            {authProviders.password === true && (
              <SettingsOptionCardContentToggle
                Icon={IconPassword}
                title={t`Password`}
                description={t`Allow users to sign in with an email and password.`}
                checked={currentWorkspace.isPasswordAuthEnabled}
                advancedMode
                onChange={() => toggleAuthMethod('password')}
              />
            )}
          </Card>
          <Card rounded>
            <SettingsOptionCardContentToggle
              Icon={IconLink}
              title={t`Invite by Link`}
              description={t`Allow the invitation of new users by sharing an invite link.`}
              checked={currentWorkspace.isPublicInviteLinkEnabled}
              advancedMode
              onChange={() =>
                handleChange(!currentWorkspace.isPublicInviteLinkEnabled)
              }
            />
          </Card>
        </>
      )}
    </StyledSettingsSecurityOptionsList>
  );
};
