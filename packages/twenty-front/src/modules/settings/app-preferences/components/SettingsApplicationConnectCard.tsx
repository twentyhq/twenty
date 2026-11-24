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
    connectionProvider,
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
        connectionProvider={connectionProvider}
        redirectLocation={redirectLocation}
      />
    </>
  );
};
