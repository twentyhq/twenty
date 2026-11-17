import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

type SettingsApplicationProviderConnectionsProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'type' | 'logoUrl'
  >;
  connections: ConnectedAccount[];
  canStartAuthorization: boolean;
  isLoading: boolean;
  hasLoadError: boolean;
  onRetry: () => void;
  connectTitle: string;
  redirectLocation: string;
};

export const SettingsApplicationProviderConnections = ({
  applicationId,
  connectionProvider,
  connections,
  canStartAuthorization,
  isLoading,
  hasLoadError,
  onRetry,
  connectTitle,
  redirectLocation,
}: SettingsApplicationProviderConnectionsProps) => {
  const { t } = useLingui();

  if (hasLoadError) {
    return (
      <SettingsApplicationLoadErrorBanner
        message={t`Your connections could not be loaded. Check your connection and try again.`}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading || isNonEmptyArray(connections)) {
    return (
      <>
        <SettingsAppPreferencesConnectionsTable
          applicationId={applicationId}
          connectionProviderName={connectionProvider.name}
          connectionProviderType={connectionProvider.type}
          connections={connections}
          canStartAuthorization={canStartAuthorization}
          isLoading={isLoading}
          reconnectRedirectLocation={redirectLocation}
        />
        {canStartAuthorization && (
          <SettingsApplicationAddConnectionButton
            applicationId={applicationId}
            connectionProviderName={connectionProvider.name}
            connectionProviderType={connectionProvider.type}
            redirectLocation={redirectLocation}
          />
        )}
      </>
    );
  }

  return (
    canStartAuthorization && (
      <SettingsApplicationConnectCard
        applicationId={applicationId}
        connectionProvider={connectionProvider}
        title={connectTitle}
        redirectLocation={redirectLocation}
      />
    )
  );
};
