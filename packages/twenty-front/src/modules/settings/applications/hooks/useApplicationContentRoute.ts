import { isNonEmptyString } from '@sniptt/guards';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useInstalledApplicationContent } from '@/settings/applications/hooks/useInstalledApplicationContent';
import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';

export const useApplicationContentRoute = () => {
  const {
    applicationId = '',
    availableApplicationId = '',
    contentType,
  } = useParams<{
    applicationId: string;
    availableApplicationId: string;
    contentType: string;
  }>();

  const isMarketplaceRoute = isNonEmptyString(availableApplicationId);

  const installed = useInstalledApplicationContent({
    applicationId,
    shouldSkip: isMarketplaceRoute,
  });
  const marketplace = useMarketplaceApplicationContent(
    isMarketplaceRoute ? availableApplicationId : undefined,
  );

  if (isMarketplaceRoute) {
    const location: ApplicationContentLocation = {
      kind: 'marketplace',
      availableApplicationId,
    };

    return {
      ...marketplace,
      contentType,
      location,
      applicationPath: getSettingsPath(
        SettingsPath.AvailableApplicationDetail,
        {
          availableApplicationId,
        },
      ),
      contentPath: getApplicationContentPath({ location }),
    };
  }

  const location: ApplicationContentLocation = {
    kind: 'installed',
    applicationId,
  };

  return {
    name: installed.application?.name,
    logoUrl: installed.application?.logoUrl,
    installedApplicationId: installed.application?.id,
    content: installed.content,
    isLoading: installed.isLoading,
    contentType,
    location,
    applicationPath: getSettingsPath(SettingsPath.ApplicationDetail, {
      applicationId,
    }),
    contentPath: getApplicationContentPath({ location }),
  };
};
