import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  type IconComponent,
  IconGoogle,
  IconMicrosoft,
  IconPassword,
} from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import {
  type AuthBypassProviders,
  type AuthProviders,
  useUpdateWorkspaceMutation,
} from '~/generated-metadata/graphql';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';

type BypassToggleDefinition = {
  key:
    | 'isGoogleAuthBypassEnabled'
    | 'isMicrosoftAuthBypassEnabled'
    | 'isPasswordAuthBypassEnabled';
  Icon: IconComponent;
  providerKey: 'google' | 'microsoft' | 'password';
  title: string;
  description: string;
};

const StyledSettingsSecurityOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const computeWorkspaceAuthBypassProviders = ({
  workspace,
  authProviders,
}: {
  workspace: {
    isGoogleAuthBypassEnabled?: boolean;
    isMicrosoftAuthBypassEnabled?: boolean;
    isPasswordAuthBypassEnabled?: boolean;
  } | null;
  authProviders?: AuthProviders | null;
}): AuthBypassProviders | null => {
  if (!workspace || !authProviders) {
    return null;
  }

  return {
    google: Boolean(
      authProviders.google && workspace.isGoogleAuthBypassEnabled,
    ),
    microsoft: Boolean(
      authProviders.microsoft && workspace.isMicrosoftAuthBypassEnabled,
    ),
    password: Boolean(
      authProviders.password && workspace.isPasswordAuthBypassEnabled,
    ),
  };
};

export const SettingsSecurityAuthBypassOptionsList = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const authProviders = useRecoilValue(authProvidersState);
  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);
  const setWorkspaceAuthBypassProviders = useSetRecoilState(
    workspaceAuthBypassProvidersState,
  );
  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const bypassToggleDefinitions: BypassToggleDefinition[] = useMemo(
    () => [
      {
        key: 'isGoogleAuthBypassEnabled',
        Icon: IconGoogle,
        providerKey: 'google',
        title: t`Google`,
        description: t`Allow Google-based login for users with SSO bypass permissions.`,
      },
      {
        key: 'isMicrosoftAuthBypassEnabled',
        Icon: IconMicrosoft,
        providerKey: 'microsoft',
        title: t`Microsoft`,
        description: t`Allow Microsoft-based login for users with SSO bypass permissions.`,
      },
      {
        key: 'isPasswordAuthBypassEnabled',
        Icon: IconPassword,
        providerKey: 'password',
        title: t`Password`,
        description: t`Allow email and password login for users with SSO bypass permissions.`,
      },
    ],
    [t],
  );

  if (!currentWorkspace) {
    return null;
  }

  const hasSSOIdentityProviders = (SSOIdentitiesProviders?.length ?? 0) > 0;

  if (!hasSSOIdentityProviders) {
    return null;
  }

  useEffect(() => {
    setWorkspaceAuthBypassProviders(
      computeWorkspaceAuthBypassProviders({
        workspace: currentWorkspace,
        authProviders,
      }),
    );
  }, [
    authProviders,
    currentWorkspace,
    setWorkspaceAuthBypassProviders,
  ]);

  const handleToggle = async (definition: BypassToggleDefinition) => {
    if (!currentWorkspace?.id) {
      throw new Error(t`User is not logged in`);
    }

    const previousWorkspace = currentWorkspace;
    const nextValue = !currentWorkspace[definition.key];

    const updatedWorkspace = {
      ...currentWorkspace,
      [definition.key]: nextValue,
    };

    setCurrentWorkspace(updatedWorkspace);

    try {
      await updateWorkspace({
        variables: {
          input: {
            [definition.key]: nextValue,
          },
        },
      });
    } catch (err) {
      setCurrentWorkspace(previousWorkspace);
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
    }
  };

  const visibleToggles = useMemo(() => {
    if (!authProviders) {
      return [];
    }

    return bypassToggleDefinitions.filter(({ providerKey }) => {
      if (providerKey === 'google') {
        return authProviders.google === true;
      }
      if (providerKey === 'microsoft') {
        return authProviders.microsoft === true;
      }
      if (providerKey === 'password') {
        return authProviders.password === true;
      }

      return false;
    });
  }, [authProviders, bypassToggleDefinitions]);

  if (visibleToggles.length === 0) {
    return null;
  }

  return (
    <StyledSettingsSecurityOptionsList>
      <Card rounded>
        {visibleToggles.map((definition, index) => {
          const { Icon, key, description, title } = definition;

          return (
            <SettingsOptionCardContentToggle
              key={key}
              Icon={Icon}
              title={title}
              description={description}
              checked={Boolean(currentWorkspace[key])}
              advancedMode
              divider={index !== visibleToggles.length - 1}
              onChange={() => handleToggle(definition)}
            />
          );
        })}
      </Card>
    </StyledSettingsSecurityOptionsList>
  );
};
