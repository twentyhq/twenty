import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { SettingsApplicationContentItemsTable } from '@/settings/applications/components/SettingsApplicationContentItemsTable';
import { SettingsApplicationContentPageLayout } from '@/settings/applications/components/SettingsApplicationContentPageLayout';
import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { useApplicationContentRoute } from '@/settings/applications/hooks/useApplicationContentRoute';
import { isApplicationContentType } from '@/settings/applications/utils/isApplicationContentType';

export const SettingsApplicationContentTypeDetail = () => {
  const { t } = useLingui();
  const {
    contentType,
    name,
    content,
    applicationPath,
    contentPath,
    location,
    installedApplicationId,
  } = useApplicationContentRoute();

  if (!isApplicationContentType(contentType)) {
    return <Navigate to={contentPath} replace />;
  }

  const contentTypeLabel = t(
    APPLICATION_CONTENT_TYPE_CONFIGS[contentType].label,
  );

  return (
    <SettingsApplicationContentPageLayout
      applicationName={name ?? t`Application`}
      applicationPath={applicationPath}
      contentPath={contentPath}
      contentTypeLabel={contentTypeLabel}
      title={contentTypeLabel}
      icon={<SettingsApplicationContentTypeIcon contentType={contentType} />}
      isLoading={!isDefined(content)}
    >
      {isDefined(content) && (
        <SettingsApplicationContentItemsTable
          contentType={contentType}
          content={content}
          location={location}
          installedApplicationId={installedApplicationId}
        />
      )}
    </SettingsApplicationContentPageLayout>
  );
};
