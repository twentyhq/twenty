import { isNonEmptyString } from '@sniptt/guards';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useInstalledApplicationContent } from '@/settings/applications/hooks/useInstalledApplicationContent';
import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';

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
    skip: isMarketplaceRoute,
  });
  const marketplace = useMarketplaceApplicationContent(
    isMarketplaceRoute ? availableApplicationId : undefined,
  );

  if (isMarketplaceRoute) {
    return {
      contentType,
      name: marketplace.name,
      logoUrl: marketplace.logoUrl,
      installedApplicationId: marketplace.installedApplicationId,
      content: marketplace.content,
      isLoading: marketplace.isLoading,
      applicationPath: getSettingsPath(
        SettingsPath.AvailableApplicationDetail,
        {
          availableApplicationId,
        },
      ),
      contentPath: getSettingsPath(SettingsPath.AvailableApplicationContent, {
        availableApplicationId,
      }),
      getContentTypePath: (type: ApplicationContentType) =>
        getSettingsPath(SettingsPath.AvailableApplicationContentTypeDetail, {
          availableApplicationId,
          contentType: type,
        }),
    };
  }

  return {
    contentType,
    name: installed.application?.name,
    logoUrl: installed.application?.logoUrl,
    installedApplicationId: installed.application?.id,
    content: installed.content,
    isLoading: installed.isLoading,
    applicationPath: getSettingsPath(SettingsPath.ApplicationDetail, {
      applicationId,
    }),
    contentPath: getSettingsPath(SettingsPath.ApplicationContent, {
      applicationId,
    }),
    getContentTypePath: (type: ApplicationContentType) =>
      getSettingsPath(SettingsPath.ApplicationContentTypeDetail, {
        applicationId,
        contentType: type,
      }),
  };
};
