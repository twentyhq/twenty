import { AppChip } from '@/applications/components/AppChip';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'type' | 'logoUrl'
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
  const { startAppConnection } = useStartAppConnection();

  return (
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
        startAppConnection({
          applicationId,
          connectionProviderName: connectionProvider.name,
          connectionProviderType: connectionProvider.type,
          redirectLocation,
        })
      }
    />
  );
};
