import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsApplicationContentOverview } from '@/settings/applications/components/SettingsApplicationContentOverview';
import { SettingsApplicationContentPageLayout } from '@/settings/applications/components/SettingsApplicationContentPageLayout';
import { useApplicationContentRoute } from '@/settings/applications/hooks/useApplicationContentRoute';

export const SettingsApplicationContent = () => {
  const { t } = useLingui();
  const {
    name,
    logoUrl,
    installedApplicationId,
    content,
    error,
    applicationPath,
    contentPath,
    location,
  } = useApplicationContentRoute();

  const displayName = name ?? t`Application`;

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
      isLoading={!isDefined(content) && !isDefined(error)}
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
