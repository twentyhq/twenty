import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { capitalize } from 'twenty-shared/utils';
import { IconGoogle, IconMicrosoft, IconPassword } from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import {
  type AuthProviders,
  UpdateWorkspaceDocument,
} from '~/generated-metadata/graphql';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledSettingsSecurityOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsSecurityAuthBypassOptionsList = () => {
  const { t } = useLingui();

  const { enqueueErrorSnackBar } = useSnackBar();
  const authProviders = useAtomStateValue(authProvidersState);

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

  const toggleAuthBypassMethod = async (
    authProvider: keyof Omit<AuthProviders, '__typename' | 'magicLink' | 'sso'>,
  ) => {
    if (!currentWorkspace?.id) {
      throw new Error(t`User is not logged in`);
    }

    const key = `is${capitalize(authProvider)}AuthBypassEnabled`;

    if (!isValidAuthProvider(key)) {
      throw new Error(t`Invalid auth bypass provider`);
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
      setCurrentWorkspace({
        ...currentWorkspace,
        [key]: currentWorkspace[key],
      });
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
      });
    });
  };

  if (!currentWorkspace) {
    return null;
  }

  return (
    <StyledSettingsSecurityOptionsList>
      <Card rounded>
        {authProviders.google === true && (
          <SettingsOptionCardContentToggle
            Icon={IconGoogle}
            title={t`Google`}
            description={t`Allow Google-based login for users with SSO bypass permissions.`}
            checked={currentWorkspace.isGoogleAuthBypassEnabled}
            advancedMode
            divider
            onChange={() => toggleAuthBypassMethod('google')}
          />
        )}
        {authProviders.microsoft === true && (
          <SettingsOptionCardContentToggle
            Icon={IconMicrosoft}
            title={t`Microsoft`}
            description={t`Allow Microsoft-based login for users with SSO bypass permissions.`}
            checked={currentWorkspace.isMicrosoftAuthBypassEnabled}
            advancedMode
            divider
            onChange={() => toggleAuthBypassMethod('microsoft')}
          />
        )}
        {authProviders.password && (
          <SettingsOptionCardContentToggle
            Icon={IconPassword}
            title={t`Password`}
            description={t`Allow email & password login for SSO bypass users.`}
            checked={currentWorkspace.isPasswordAuthBypassEnabled}
            advancedMode
            onChange={() => toggleAuthBypassMethod('password')}
          />
        )}
      </Card>
    </StyledSettingsSecurityOptionsList>
  );
};
