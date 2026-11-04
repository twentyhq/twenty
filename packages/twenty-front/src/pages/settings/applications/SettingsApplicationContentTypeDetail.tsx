import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { SettingsApplicationContentItemsTable } from '@/settings/applications/components/SettingsApplicationContentItemsTable';
import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentRoute } from '@/settings/applications/hooks/useApplicationContentRoute';
import { isApplicationContentType } from '@/settings/applications/utils/isApplicationContentType';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';

export const SettingsApplicationContentTypeDetail = () => {
  const { t } = useLingui();
  const {
    contentType,
    name,
    content,
    applicationPath,
    contentPath,
    getContentTypePath,
  } = useApplicationContentRoute();

  if (!isApplicationContentType(contentType)) {
    return <Navigate to={contentPath} replace />;
  }

  const contentTypeLabel = t(
    APPLICATION_CONTENT_TYPE_CONFIGS[contentType].label,
  );
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
        { children: t`Content`, href: contentPath },
        { children: contentTypeLabel },
      ]}
      title={contentTypeLabel}
      icon={<SettingsApplicationContentTypeIcon contentType={contentType} />}
    >
      <SettingsPageContainer>
        {isDefined(content) ? (
          <SettingsApplicationContentItemsTable
            contentType={contentType}
            content={content}
            getContentTypePath={getContentTypePath}
          />
        ) : (
          <SettingsSectionSkeletonLoader />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
