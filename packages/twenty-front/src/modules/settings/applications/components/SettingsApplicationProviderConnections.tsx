import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
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
  connectTitle: string;
  redirectLocation: string;
};

export const SettingsApplicationProviderConnections = ({
  applicationId,
  connectionProvider,
  connections,
  canStartAuthorization,
  isLoading,
  connectTitle,
  redirectLocation,
}: SettingsApplicationProviderConnectionsProps) => {
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

  if (!canStartAuthorization) {
    return null;
  }

  return (
    <SettingsApplicationConnectCard
      applicationId={applicationId}
      connectionProvider={connectionProvider}
      title={connectTitle}
      redirectLocation={redirectLocation}
    />
  );
};
