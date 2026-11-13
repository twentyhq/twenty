import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { Key } from 'ts-key-enum';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';
import { useAccountsSettingsBreadcrumbLink } from '@/settings/app-preferences/hooks/useAccountsSettingsBreadcrumbLink';
import { useConnectApplicationWithApiKey } from '@/settings/applications/hooks/useConnectApplicationWithApiKey';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';

export const SettingsApplicationConnectWithApiKey = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId = '', connectionProviderName = '' } = useParams();
  const [searchParams] = useSearchParams();
  const reconnectingConnectedAccountId = searchParams.get(
    'reconnectingConnectedAccountId',
  );
  const accountsBreadcrumbLink = useAccountsSettingsBreadcrumbLink(t`Accounts`);
  const { connectionProviders } =
    useFindApplicationConnectionProviders(applicationId);
  const [apiKey, setApiKey] = useState('');
  const {
    connectApplicationWithApiKey,
    loading,
    errorMessage,
    clearErrorMessage,
  } = useConnectApplicationWithApiKey();

  const connectionProvider = connectionProviders.find(
    (provider) => provider.name === connectionProviderName,
  );
  const connectionProviderDisplayName =
    connectionProvider?.displayName ?? connectionProviderName;
  const isWorkspaceConnection = connectionProvider?.scope === 'WORKSPACE';

  const parentLinks = isWorkspaceConnection
    ? [
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.ApplicationDetail, {
            applicationId,
          }),
        },
      ]
    : [
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        accountsBreadcrumbLink,
      ];

  const stateReturnTo =
    typeof location.state === 'object' &&
    isDefined(location.state) &&
    'returnTo' in location.state &&
    typeof location.state.returnTo === 'string' &&
    isValidReturnToPath(location.state.returnTo)
      ? location.state.returnTo
      : undefined;
  const returnTo = stateReturnTo ?? parentLinks[parentLinks.length - 1].href;

  const canConnect = isNonEmptyString(apiKey.trim()) && !loading;

  const handleConnect = async () => {
    if (!canConnect) {
      return;
    }

    const isConnected = await connectApplicationWithApiKey({
      applicationId,
      connectionProviderName,
      connectionProviderDisplayName,
      apiKey,
      reconnectingConnectedAccountId,
    });

    if (isConnected) {
      navigate(returnTo);
    }
  };

  const title = t`Connect ${connectionProviderDisplayName}`;

  return (
    <SettingsPageLayout
      title={title}
      links={[...parentLinks, { children: title }]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canConnect}
          isCancelDisabled={loading}
          isLoading={loading}
          onCancel={() => navigate(returnTo)}
          onSave={handleConnect}
        />
      }
    >
      <SettingsPageContainer>
        <Section.Root>
          <SettingsTextInput
            instanceId="application-connect-with-api-key"
            label={t`API key`}
            hint={t`Paste a key from your ${connectionProviderDisplayName} settings. It is stored encrypted.`}
            type="password"
            autoComplete="new-password"
            ignorePasswordManagers
            autoFocusOnMount
            value={apiKey}
            error={errorMessage ?? undefined}
            onChange={(value) => {
              setApiKey(value);
              clearErrorMessage();
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) {
                return;
              }

              if (event.key === Key.Enter) {
                handleConnect();
              }
            }}
            fullWidth
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
