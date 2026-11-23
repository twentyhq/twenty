import { AppChip } from '@/applications/components/AppChip';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationConnectionBillingValidationModal } from '@/settings/applications/components/SettingsApplicationConnectionBillingValidationModal';
import { useStartNewAppConnection } from '@/settings/applications/hooks/useStartNewAppConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'type' | 'displayName' | 'logoUrl' | 'connectedAccountPrices'
  >;
  title: string;
  redirectLocation: string;
};

export const SettingsApplicationConnectCard = ({
  applicationId,
  connectionProvider,
  title,
  redirectLocation,
}: SettingsApplicationConnectCardProps) => {
  const { startNewAppConnection } = useStartNewAppConnection({
    applicationId,
    connectionProviderName: connectionProvider.name,
    connectionProviderType: connectionProvider.type,
    connectedAccountPrices: connectionProvider.connectedAccountPrices,
    redirectLocation,
  });

  return (
    <>
      <SettingsCard
        Icon={
          <AppChip
            applicationId={applicationId}
            logoUrl={connectionProvider.logoUrl}
            size="md"
            chipOnly
          />
        }
        title={title}
        onClick={startNewAppConnection}
      />
      <SettingsApplicationConnectionBillingValidationModal
        applicationId={applicationId}
        connectionProviderName={connectionProvider.name}
        connectionProviderType={connectionProvider.type}
        connectionProviderDisplayName={connectionProvider.displayName}
        connectionProviderLogoUrl={connectionProvider.logoUrl}
        connectedAccountPrices={connectionProvider.connectedAccountPrices}
        redirectLocation={redirectLocation}
      />
    </>
  );
};
