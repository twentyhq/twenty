import { AppChip } from '@/applications/components/AppChip';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { getApplicationPreferencesGeneralPath } from '@/settings/app-preferences/utils/getApplicationPreferencesGeneralPath';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'logoUrl'
  >;
  title: string;
};

export const SettingsApplicationConnectCard = ({
  applicationId,
  connectionProvider,
  title,
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
          redirectLocation: getApplicationPreferencesGeneralPath(applicationId),
        })
      }
    />
  );
};
