import { AppChip } from '@/applications/components/AppChip';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationApiKeyConnectionDialog } from '@/settings/applications/components/SettingsApplicationApiKeyConnectionDialog';
import { useStartApplicationConnection } from '@/settings/applications/hooks/useStartApplicationConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'displayName' | 'type' | 'logoUrl'
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
  const { startApplicationConnection } = useStartApplicationConnection();

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
        onClick={() =>
          startApplicationConnection({
            applicationId,
            connectionProvider,
            redirectLocation,
          })
        }
      />
      <SettingsApplicationApiKeyConnectionDialog
        applicationId={applicationId}
        connectionProvider={connectionProvider}
      />
    </>
  );
};
