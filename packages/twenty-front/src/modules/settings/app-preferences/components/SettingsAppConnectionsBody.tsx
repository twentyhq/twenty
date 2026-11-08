import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesConnectionsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTable';
import { SettingsApplicationConnectCard } from '@/settings/app-preferences/components/SettingsApplicationConnectCard';
import { SettingsApplicationAddConnectionButton } from '@/settings/applications/components/SettingsApplicationAddConnectionButton';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';

type SettingsAppConnectionsBodyProps = {
  applicationId: string;
  connectionProvider: { name: string; logoUrl: string | null };
  connections: ConnectedAccount[];
  isLoading: boolean;
  hasLoadError: boolean;
  onRetry: () => void;
  canStartAuthorization: boolean;
  connectCardTitle: string;
  redirectLocation: string;
};

export const SettingsAppConnectionsBody = ({
  applicationId,
  connectionProvider,
  connections,
  isLoading,
  hasLoadError,
  onRetry,
  canStartAuthorization,
  connectCardTitle,
  redirectLocation,
}: SettingsAppConnectionsBodyProps) => {
  const { t } = useLingui();

  if (hasLoadError) {
    return (
      <SettingsApplicationLoadErrorBanner
        message={t`Your connections could not be loaded. Check your connection and try again.`}
        onRetry={onRetry}
      />
    );
  }

  if (!isLoading && !isNonEmptyArray(connections)) {
    return canStartAuthorization ? (
      <SettingsApplicationConnectCard
        applicationId={applicationId}
        connectionProvider={connectionProvider}
        title={connectCardTitle}
        redirectLocation={redirectLocation}
      />
    ) : null;
  }

  return (
    <>
      <SettingsAppPreferencesConnectionsTable
        applicationId={applicationId}
        providerName={connectionProvider.name}
        connections={connections}
        canStartAuthorization={canStartAuthorization}
        isLoading={isLoading}
        reconnectRedirectLocation={redirectLocation}
      />
      {canStartAuthorization && (
        <SettingsApplicationAddConnectionButton
          applicationId={applicationId}
          providerName={connectionProvider.name}
          redirectLocation={redirectLocation}
        />
      )}
    </>
  );
};
