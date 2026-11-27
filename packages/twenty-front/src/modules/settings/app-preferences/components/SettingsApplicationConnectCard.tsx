import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationConnectionProviderLogo } from '@/settings/applications/components/SettingsApplicationConnectionProviderLogo';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'type' | 'displayName' | 'logoUrl'
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
        <SettingsApplicationConnectionProviderLogo
          connectionProvider={connectionProvider}
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
