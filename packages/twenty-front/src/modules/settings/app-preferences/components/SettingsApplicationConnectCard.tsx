import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { isNonEmptyString } from '@sniptt/guards';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

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
        isNonEmptyString(connectionProvider.logoUrl) ? (
          <Avatar
            shape="square"
            variant="outline"
            size="md"
            src={getAbsoluteImageUrl(connectionProvider.logoUrl)}
            name={connectionProvider.displayName}
            imageProps={{ alt: connectionProvider.displayName }}
          />
        ) : undefined
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
