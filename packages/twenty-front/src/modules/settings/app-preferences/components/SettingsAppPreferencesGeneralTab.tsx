import { SettingsAppPreferencesConnectionsTab } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectionsTab';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationOverviewCard } from '@/settings/applications/components/SettingsApplicationOverviewCard';
import { useApplicationOverview } from '@/settings/applications/hooks/useApplicationOverview';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

type SettingsAppPreferencesGeneralTabProps = {
  application: ApplicationWithPreferences['application'];
  displayName: string;
  connectionProviders: ApplicationWithPreferences['connectionProviders'];
  connectionRedirectLocation: string;
};

export const SettingsAppPreferencesGeneralTab = ({
  application,
  displayName,
  connectionProviders,
  connectionRedirectLocation,
}: SettingsAppPreferencesGeneralTabProps) => {
  const { description, coverImageUrl } = useApplicationOverview({
    application,
  });

  return (
    <>
      <Section.Root>
        <SettingsApplicationOverviewCard
          applicationId={application.id}
          displayName={displayName}
          description={description}
          coverImageUrl={coverImageUrl}
        />
      </Section.Root>
      {isNonEmptyArray(connectionProviders) && (
        <SettingsAppPreferencesConnectionsTab
          applicationId={application.id}
          connectionProviders={connectionProviders}
          connectionRedirectLocation={connectionRedirectLocation}
        />
      )}
    </>
  );
};
