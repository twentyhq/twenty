import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { AppChip } from '@/applications/components/AppChip';
import { SettingsApplicationContentOverview } from '@/settings/applications/components/SettingsApplicationContentOverview';
import { useApplicationContentRoute } from '@/settings/applications/hooks/useApplicationContentRoute';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';

export const SettingsApplicationContent = () => {
  const { t } = useLingui();
  const {
    name,
    logoUrl,
    installedApplicationId,
    content,
    applicationPath,
    location,
  } = useApplicationContentRoute();

  const displayName = name ?? t`Application`;

  return (
    <SettingsPageLayout
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: displayName, href: applicationPath },
        { children: t`Content` },
      ]}
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
    >
      <SettingsPageContainer>
        {isDefined(content) ? (
          <SettingsApplicationContentOverview
            content={content}
            location={location}
          />
        ) : (
          <SettingsSectionSkeletonLoader />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
