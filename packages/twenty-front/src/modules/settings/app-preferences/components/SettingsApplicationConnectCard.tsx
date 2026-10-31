import { AppChip } from '@/applications/components/AppChip';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'logoUrl'
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
  const { triggerAppOAuth } = useTriggerAppOAuth();

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
        triggerAppOAuth({
          applicationId,
          providerName: connectionProvider.name,
          redirectLocation,
        })
      }
    />
  );
};
