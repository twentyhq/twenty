import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useParams } from 'react-router-dom';
import { doNotTranslate } from 'twenty-shared/i18n';
import { SettingsPath } from 'twenty-shared/types';
import { CustomError, getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useInstalledApplicationContent } from '@/settings/applications/hooks/useInstalledApplicationContent';
import { useMarketplaceApplicationContent } from '@/settings/applications/hooks/useMarketplaceApplicationContent';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';

export const useApplicationContentRoute = () => {
  const { t } = useLingui();
  const { applicationId, availableApplicationId, contentType } = useParams<{
    applicationId: string;
    availableApplicationId: string;
    contentType: string;
  }>();

  const isMarketplaceRoute = isNonEmptyString(availableApplicationId);

  const installed = useInstalledApplicationContent({
    applicationId,
    shouldSkip: isMarketplaceRoute,
  });
  const marketplace = useMarketplaceApplicationContent(availableApplicationId);

  const getRouteApplication = () => {
    if (isNonEmptyString(availableApplicationId)) {
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

    if (!isNonEmptyString(applicationId)) {
      throw new CustomError(
        doNotTranslate('Application id is not defined'),
        'APPLICATION_ID_NOT_DEFINED',
      );
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
      error: installed.error,
      contentType,
      location,
      applicationPath: getSettingsPath(SettingsPath.ApplicationDetail, {
        applicationId,
      }),
      contentPath: getApplicationContentPath({ location }),
    };
  };

  const routeApplication = getRouteApplication();

  return {
    ...routeApplication,
    displayName: routeApplication.name ?? t`Application`,
    isLoading:
      !isDefined(routeApplication.content) &&
      !isDefined(routeApplication.error),
  };
};
