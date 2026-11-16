import { isDefined } from 'twenty-shared/utils';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsApplicationContentPageLayout } from '@/settings/applications/components/SettingsApplicationContentPageLayout';
import { SettingsApplicationContentSummarySection } from '@/settings/applications/components/SettingsApplicationContentSummarySection';
import { useApplicationContentRoute } from '@/settings/applications/hooks/useApplicationContentRoute';

export const SettingsAvailableApplicationResources = () => {
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
        <SettingsApplicationContentSummarySection
          applicationName={displayName}
          content={content}
          location={location}
        />
      )}
    </SettingsApplicationContentPageLayout>
  );
};
