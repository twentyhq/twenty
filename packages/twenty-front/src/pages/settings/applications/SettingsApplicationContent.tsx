import { isDefined } from 'twenty-shared/utils';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsApplicationContentOverview } from '@/settings/applications/components/SettingsApplicationContentOverview';
import { SettingsApplicationContentPageLayout } from '@/settings/applications/components/SettingsApplicationContentPageLayout';
import { useApplicationContentRoute } from '@/settings/applications/hooks/useApplicationContentRoute';

export const SettingsApplicationContent = () => {
  const {
    displayName,
    logoUrl,
    installedApplicationId,
    content,
    error,
    isLoading,
    applicationPath,
    contentPath,
    location,
  } = useApplicationContentRoute();

  return (
    <SettingsApplicationContentPageLayout
      applicationName={displayName}
      applicationPath={applicationPath}
      contentPath={contentPath}
      title={displayName}
      icon={
        <AppChip
          applicationId={installedApplicationId}
          logoUrl={logoUrl}
          fallbackApplicationData={{ name: displayName }}
          size="md"
          chipOnly
        />
      }
      isLoading={isLoading}
    >
      <ToastOnQueryErrorEffect error={error} />
      {isDefined(content) && (
        <SettingsApplicationContentOverview
          content={content}
          location={location}
        />
      )}
    </SettingsApplicationContentPageLayout>
  );
};
