import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authBypassProvidersState } from '@/client-config/states/authBypassProvidersState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SSOIdentitiesProvidersState } from '@/settings/security/states/SSOIdentitiesProvidersState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  type IconComponent,
  IconGoogle,
  IconMicrosoft,
  IconPassword,
} from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { useUpdateWorkspaceMutation } from '~/generated-metadata/graphql';

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

export const SettingsSecurityAuthBypassOptionsList = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const authBypassProviders = useRecoilValue(authBypassProvidersState);
  const SSOIdentitiesProviders = useRecoilValue(SSOIdentitiesProvidersState);
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

  const handleToggle = async (key: BypassToggleDefinition['key']) => {
    if (!currentWorkspace.id) {
      throw new Error(t`User is not logged in`);
    }

    const nextValue = !currentWorkspace[key];

    setCurrentWorkspace({
      ...currentWorkspace,
      [key]: nextValue,
    });

    try {
      await updateWorkspace({
        variables: {
          input: {
            [key]: nextValue,
          },
        },
      });
    } catch (err) {
      setCurrentWorkspace({
        ...currentWorkspace,
        [key]: !nextValue,
      });
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
    }
  };

  const visibleToggles = bypassToggleDefinitions.filter(
    ({ providerKey }) => authBypassProviders[providerKey] === true,
  );

  if (visibleToggles.length === 0) {
    return null;
  }

  return (
    <StyledSettingsSecurityOptionsList>
      <Card rounded>
        {visibleToggles.map(({ Icon, key, description, title }, index) => (
          <SettingsOptionCardContentToggle
            key={key}
            Icon={Icon}
            title={title}
            description={description}
            checked={Boolean(currentWorkspace[key])}
            advancedMode
            divider={index !== visibleToggles.length - 1}
            onChange={() => handleToggle(key)}
          />
        ))}
      </Card>
    </StyledSettingsSecurityOptionsList>
  );
};
