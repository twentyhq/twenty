import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationConnectionProviderLogo } from '@/settings/applications/components/SettingsApplicationConnectionProviderLogo';
import { SettingsApplicationConnectionProviderVia } from '@/settings/applications/components/SettingsApplicationConnectionProviderVia';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { isDefined } from 'twenty-shared/utils';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'type' | 'displayName' | 'logoUrl' | 'via'
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
      titleAccessory={
        isDefined(connectionProvider.via) ? (
          <SettingsApplicationConnectionProviderVia
            via={connectionProvider.via}
          />
        ) : undefined
      }
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
