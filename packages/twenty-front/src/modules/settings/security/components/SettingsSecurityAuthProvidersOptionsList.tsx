import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useReadDefaultDomainFromConfiguration } from '@/domain-manager/hooks/useReadDefaultDomainFromConfiguration';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import {
  IconGoogle,
  IconLink,
  IconList,
  IconMicrosoft,
  IconPassword,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import {
  type AuthProviders,
  UpdateWorkspaceDocument,
  WorkspaceDiscoverability,
} from '~/generated-metadata/graphql';

import { Toggle2FA } from './Toggle2FA';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledSettingsSecurityOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsSecurityAuthProvidersOptionsList = () => {
  const { t } = useLingui();

  const { enqueueErrorSnackBar } = useSnackBar();
  const SSOIdentitiesProviders = useAtomStateValue(SSOIdentitiesProvidersState);
  const authProviders = useAtomStateValue(authProvidersState);
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const { defaultDomain } = useReadDefaultDomainFromConfiguration();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

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
      return enqueueErrorSnackBar({
        message: t`At least one authentication method must be enabled`,
      });
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
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
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
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
      });
    }
  };

  const discoverabilityOptions = [
    {
      value: WorkspaceDiscoverability.PUBLIC,
      label: t`Discoverable`,
    },
    {
      value: WorkspaceDiscoverability.MEMBERS_AND_INVITEES,
      label: t`Members & invitees`,
    },
    {
      value: WorkspaceDiscoverability.HIDDEN,
      label: t`Hidden`,
    },
  ];

  const getDiscoverabilityDescription = (value: WorkspaceDiscoverability) => {
    switch (value) {
      case WorkspaceDiscoverability.MEMBERS_AND_INVITEES:
        return t`Hidden from email-domain discovery. Members and invitees still see it.`;
      case WorkspaceDiscoverability.HIDDEN:
        return t`Never shown at sign-in. Members use the workspace URL.`;
      case WorkspaceDiscoverability.PUBLIC:
      default:
        return t`Anyone with an approved email domain can find and join.`;
    }
  };

  const handleDiscoverabilityChange = (value: WorkspaceDiscoverability) => {
    if (!currentWorkspace) {
      return;
    }

    const previousValue = currentWorkspace.workspaceDiscoverability;

    setCurrentWorkspace((currentWorkspaceValue) =>
      currentWorkspaceValue
        ? { ...currentWorkspaceValue, workspaceDiscoverability: value }
        : currentWorkspaceValue,
    );

    updateWorkspace({
      variables: {
        input: {
          workspaceDiscoverability: value,
        },
      },
    }).catch((err) => {
      setCurrentWorkspace((currentWorkspaceValue) =>
        currentWorkspaceValue
          ? {
              ...currentWorkspaceValue,
              workspaceDiscoverability: previousValue,
            }
          : currentWorkspaceValue,
      );
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
      });
    });
  };

  return (
    <StyledSettingsSecurityOptionsList>
      {currentWorkspace && (
        <>
          <Card rounded>
            {authProviders.google === true && (
              <SettingsOptionCardContentToggle
                Icon={IconGoogle}
                title={t`Google`}
                description={t`Allow logins through Google's single sign-on functionality.`}
                checked={currentWorkspace.isGoogleAuthEnabled}
                advancedMode
                divider
                onChange={() =>
                  toggleAuthMethod(ConnectedAccountProvider.GOOGLE)
                }
              />
            )}
            {authProviders.microsoft === true && (
              <SettingsOptionCardContentToggle
                Icon={IconMicrosoft}
                title={t`Microsoft`}
                description={t`Allow logins through Microsoft's single sign-on functionality.`}
                checked={currentWorkspace.isMicrosoftAuthEnabled}
                advancedMode
                divider
                onChange={() =>
                  toggleAuthMethod(ConnectedAccountProvider.MICROSOFT)
                }
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
              divider
              onChange={() =>
                handleChange(!currentWorkspace.isPublicInviteLinkEnabled)
              }
            />
            {isMultiWorkspaceEnabled && (
              <SettingsOptionCardContentSelect
                Icon={IconList}
                title={t`Discovery on ${defaultDomain}`}
                description={getDiscoverabilityDescription(
                  currentWorkspace.workspaceDiscoverability,
                )}
                divider
              >
                <Select<WorkspaceDiscoverability>
                  dropdownId="workspace-discoverability-select"
                  dropdownWidth={220}
                  value={currentWorkspace.workspaceDiscoverability}
                  onChange={handleDiscoverabilityChange}
                  options={discoverabilityOptions}
                  selectSizeVariant="small"
                  withSearchInput={false}
                />
              </SettingsOptionCardContentSelect>
            )}
            <Toggle2FA />
          </Card>
        </>
      )}
    </StyledSettingsSecurityOptionsList>
  );
};
