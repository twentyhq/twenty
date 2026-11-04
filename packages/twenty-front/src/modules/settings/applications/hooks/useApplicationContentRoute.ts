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

  const location: ApplicationContentLocation = isMarketplaceRoute
    ? { kind: 'marketplace', availableApplicationId }
    : { kind: 'installed', applicationId };

  const source = isMarketplaceRoute
    ? marketplace
    : {
        name: installed.application?.name,
        logoUrl: installed.application?.logoUrl,
        installedApplicationId: installed.application?.id,
        content: installed.content,
        isLoading: installed.isLoading,
      };

  return {
    ...source,
    contentType,
    location,
    applicationPath: isMarketplaceRoute
      ? getSettingsPath(SettingsPath.AvailableApplicationDetail, {
          availableApplicationId,
        })
      : getSettingsPath(SettingsPath.ApplicationDetail, { applicationId }),
    contentPath: getApplicationContentPath({ location }),
  };
};
